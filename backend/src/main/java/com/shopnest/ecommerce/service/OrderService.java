package com.shopnest.ecommerce.service;

import com.shopnest.ecommerce.dto.OrderDtos.*;
import com.shopnest.ecommerce.entity.*;
import com.shopnest.ecommerce.exception.ApiExceptions.BadRequestException;
import com.shopnest.ecommerce.exception.ApiExceptions.ResourceNotFoundException;
import com.shopnest.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    /**
     * Turns the signed-in user's cart into an order:
     * validate stock -> snapshot line items -> decrement stock ->
     * simulate payment -> empty the cart. All inside one transaction.
     */
    @Transactional
    public OrderResponse checkout(String email, CheckoutRequest request) {
        User user = currentUser(email);
        List<CartItem> cartItems = cartItemRepository.findByUserId(user.getId());

        if (cartItems.isEmpty()) {
            throw new BadRequestException("Your cart is empty");
        }

        String method = request.paymentMethod().toUpperCase(Locale.ROOT);
        if (!List.of("CARD", "UPI", "COD").contains(method)) {
            throw new BadRequestException("Unsupported payment method: " + request.paymentMethod());
        }

        OrderEntity order = OrderEntity.builder()
                .orderNumber(generateOrderNumber())
                .user(user)
                .status(OrderStatus.PLACED)
                .paymentMethod(method)
                .shippingName(request.shippingName().trim())
                .shippingPhone(request.shippingPhone().trim())
                .shippingAddress(request.shippingAddress().trim())
                .shippingCity(request.shippingCity().trim())
                .shippingPincode(request.shippingPincode().trim())
                .totalAmount(BigDecimal.ZERO)
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();

            if (!Boolean.TRUE.equals(product.getActive())) {
                throw new BadRequestException(product.getName() + " is no longer available");
            }
            if (cartItem.getQuantity() > product.getStock()) {
                throw new BadRequestException("Only " + product.getStock() + " unit(s) of "
                        + product.getName() + " left in stock");
            }

            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);

            OrderItem line = OrderItem.builder()
                    .product(product)
                    .productName(product.getName())
                    .imageUrl(product.getImageUrl())
                    .unitPrice(product.getPrice())
                    .quantity(cartItem.getQuantity())
                    .build();

            order.addItem(line);
            subtotal = subtotal.add(line.getSubtotal());
        }

        BigDecimal shipping = subtotal.compareTo(CartService.FREE_SHIPPING_THRESHOLD) >= 0
                ? BigDecimal.ZERO : CartService.SHIPPING_FEE;

        order.setTotalAmount(subtotal.add(shipping));

        // ---- simulated payment gateway ----
        if ("COD".equals(method)) {
            order.setPaymentStatus(PaymentStatus.PENDING);
        } else {
            order.setPaymentStatus(PaymentStatus.PAID);
            order.setStatus(OrderStatus.CONFIRMED);
        }
        order.setPaymentReference("PAY-" + UUID.randomUUID().toString()
                .substring(0, 12).toUpperCase(Locale.ROOT));

        OrderEntity saved = orderRepository.save(order);
        cartItemRepository.deleteByUserId(user.getId());

        log.info("Order {} placed by {} for {}", saved.getOrderNumber(), email, saved.getTotalAmount());
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> myOrders(String email) {
        return orderRepository.findByUserIdOrderByIdDesc(currentUser(email).getId())
                .stream().map(OrderService::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse myOrder(String email, Long orderId) {
        return toResponse(orderRepository
                .findByIdAndUserId(orderId, currentUser(email).getId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found")));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> allOrders() {
        return orderRepository.findAllByOrderByIdDesc().stream().map(OrderService::toResponse).toList();
    }

    /**
     * Customer cancels their own order. Only allowed while it has not shipped;
     * the reserved stock goes back to the products.
     */
    @Transactional
    public OrderResponse cancelMyOrder(String email, Long orderId) {
        OrderEntity order = orderRepository
                .findByIdAndUserId(orderId, currentUser(email).getId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("This order is already cancelled");
        }
        if (order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new BadRequestException(
                    "This order has already " + order.getStatus().name().toLowerCase(Locale.ROOT)
                            + " and can no longer be cancelled");
        }

        applyCancellation(order);
        log.info("Order {} cancelled by {}", order.getOrderNumber(), email);
        return toResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse updateStatus(Long orderId, String status) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(status.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Unknown order status: " + status);
        }

        if (newStatus == OrderStatus.CANCELLED) {
            if (order.getStatus() != OrderStatus.CANCELLED) {
                applyCancellation(order);   // also puts the stock back
            }
            return toResponse(orderRepository.save(order));
        }

        order.setStatus(newStatus);
        if (newStatus == OrderStatus.DELIVERED && order.getPaymentStatus() == PaymentStatus.PENDING) {
            order.setPaymentStatus(PaymentStatus.PAID);   // COD collected on delivery
        }
        return toResponse(orderRepository.save(order));
    }

    // ---------- helpers ----------

    /**
     * Single place that cancels an order, so the customer route and the admin
     * route can never drift apart on restoring stock or refunding.
     */
    private void applyCancellation(OrderEntity order) {
        for (OrderItem line : order.getItems()) {
            Product product = line.getProduct();
            if (product == null) continue;          // product was hard-deleted
            product.setStock(product.getStock() + line.getQuantity());
            productRepository.save(product);
        }

        order.setStatus(OrderStatus.CANCELLED);
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            order.setPaymentStatus(PaymentStatus.REFUNDED);
        }
    }

    private User currentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private String generateOrderNumber() {
        return "ORD-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase(Locale.ROOT);
    }

    static OrderResponse toResponse(OrderEntity o) {
        List<OrderItemResponse> items = o.getItems().stream()
                .map(i -> new OrderItemResponse(
                        i.getId(),
                        i.getProduct() != null ? i.getProduct().getId() : null,
                        i.getProductName(), i.getImageUrl(), i.getUnitPrice(),
                        i.getQuantity(), i.getSubtotal()))
                .toList();

        return new OrderResponse(
                o.getId(), o.getOrderNumber(),
                o.getUser().getName(), o.getUser().getEmail(),
                o.getTotalAmount(), o.getStatus().name(), o.getPaymentStatus().name(),
                o.getPaymentMethod(), o.getPaymentReference(),
                o.getShippingName(), o.getShippingPhone(), o.getShippingAddress(),
                o.getShippingCity(), o.getShippingPincode(),
                o.getCreatedAt(), items);
    }
}
