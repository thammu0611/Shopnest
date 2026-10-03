package com.shopnest.ecommerce.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public class CartDtos {

    public record AddToCartRequest(
            @NotNull Long productId,
            @NotNull @Min(1) Integer quantity
    ) {}

    public record UpdateCartRequest(
            @NotNull @Min(1) Integer quantity
    ) {}

    public record CartItemResponse(
            Long id,
            Long productId,
            String name,
            String imageUrl,
            BigDecimal price,
            Integer quantity,
            Integer stock,
            BigDecimal subtotal
    ) {}

    public record CartResponse(
            List<CartItemResponse> items,
            int totalItems,
            BigDecimal subtotal,
            BigDecimal shipping,
            BigDecimal total
    ) {}
}
