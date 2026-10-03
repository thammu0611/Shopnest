package com.shopnest.ecommerce.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDtos {

    public record CheckoutRequest(
            @NotBlank @Size(max = 100) String shippingName,
            @NotBlank @Pattern(regexp = "^[0-9+\\- ]{8,20}$", message = "invalid phone number")
            String shippingPhone,
            @NotBlank @Size(max = 255) String shippingAddress,
            @NotBlank @Size(max = 80) String shippingCity,
            @NotBlank @Pattern(regexp = "^[0-9]{4,10}$", message = "invalid pincode")
            String shippingPincode,
            @NotBlank String paymentMethod   // CARD | UPI | COD  (all simulated)
    ) {}

    public record OrderItemResponse(
            Long id,
            Long productId,
            String productName,
            String imageUrl,
            BigDecimal unitPrice,
            Integer quantity,
            BigDecimal subtotal
    ) {}

    public record OrderResponse(
            Long id,
            String orderNumber,
            String customerName,
            String customerEmail,
            BigDecimal totalAmount,
            String status,
            String paymentStatus,
            String paymentMethod,
            String paymentReference,
            String shippingName,
            String shippingPhone,
            String shippingAddress,
            String shippingCity,
            String shippingPincode,
            LocalDateTime createdAt,
            List<OrderItemResponse> items
    ) {}

    public record UpdateStatusRequest(@NotBlank String status) {}
}
