package com.shopnest.ecommerce.service;

import com.shopnest.ecommerce.dto.CartDtos.*;
import com.shopnest.ecommerce.entity.CartItem;
import com.shopnest.ecommerce.entity.Product;
import com.shopnest.ecommerce.entity.User;
import com.shopnest.ecommerce.exception.ApiExceptions.BadRequestException;
import com.shopnest.ecommerce.exception.ApiExceptions.ResourceNotFoundException;
import com.shopnest.ecommerce.repository.CartItemRepository;
import com.shopnest.ecommerce.repository.ProductRepository;
import com.shopnest.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    /** Free shipping above this order value, otherwise a flat fee. */
    public static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("2000");
    public static final BigDecimal SHIPPING_FEE = new BigDecimal("49");

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public CartResponse getCart(String email) {
        return buildCart(cartItemRepository.findByUserId(currentUser(email).getId()));
    }

    @Transactional
    public CartResponse addToCart(String email, AddToCartRequest request) {
        User user = currentUser(email);
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!Boolean.TRUE.equals(product.getActive())) {
            throw new BadRequestException("This product is no longer available");
        }

        CartItem item = cartItemRepository
                .findByUserIdAndProductId(user.getId(), product.getId())
                .orElseGet(() -> CartItem.builder()
                        .user(user).product(product).quantity(0).build());

        int newQuantity = item.getQuantity() + request.quantity();
        assertStock(product, newQuantity);

        item.setQuantity(newQuantity);
        cartItemRepository.save(item);

        return buildCart(cartItemRepository.findByUserId(user.getId()));
    }

    @Transactional
    public CartResponse updateQuantity(String email, Long cartItemId, UpdateCartRequest request) {
        User user = currentUser(email);
        CartItem item = ownedItem(user.getId(), cartItemId);

        assertStock(item.getProduct(), request.quantity());
        item.setQuantity(request.quantity());
        cartItemRepository.save(item);

        return buildCart(cartItemRepository.findByUserId(user.getId()));
    }

    @Transactional
    public CartResponse removeItem(String email, Long cartItemId) {
        User user = currentUser(email);
        cartItemRepository.delete(ownedItem(user.getId(), cartItemId));
        return buildCart(cartItemRepository.findByUserId(user.getId()));
    }

    @Transactional
    public CartResponse clear(String email) {
        cartItemRepository.deleteByUserId(currentUser(email).getId());
        return buildCart(List.of());
    }

    // ---------- helpers ----------

    private void assertStock(Product product, int requested) {
        if (requested > product.getStock()) {
            throw new BadRequestException("Only " + product.getStock()
                    + " unit(s) of " + product.getName() + " left in stock");
        }
    }

    private CartItem ownedItem(Long userId, Long cartItemId) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
        if (!item.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Cart item not found");
        }
        return item;
    }

    private User currentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    static CartResponse buildCart(List<CartItem> items) {
        List<CartItemResponse> lines = items.stream().map(i -> {
            Product p = i.getProduct();
            BigDecimal subtotal = p.getPrice().multiply(BigDecimal.valueOf(i.getQuantity()));
            return new CartItemResponse(i.getId(), p.getId(), p.getName(), p.getImageUrl(),
                    p.getPrice(), i.getQuantity(), p.getStock(), subtotal);
        }).toList();

        BigDecimal subtotal = lines.stream()
                .map(CartItemResponse::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal shipping = (lines.isEmpty() || subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0)
                ? BigDecimal.ZERO : SHIPPING_FEE;

        int totalItems = lines.stream().mapToInt(CartItemResponse::quantity).sum();

        return new CartResponse(lines, totalItems, subtotal, shipping, subtotal.add(shipping));
    }
}
