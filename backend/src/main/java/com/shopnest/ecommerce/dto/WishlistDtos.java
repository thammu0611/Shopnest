package com.shopnest.ecommerce.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public class WishlistDtos {

    public record AddToWishlistRequest(@NotNull Long productId) {}

    public record WishlistItemResponse(
            Long id,
            Long productId,
            String name,
            String imageUrl,
            BigDecimal price,
            Integer stock,
            Boolean active,
            String categoryName,
            Double averageRating,
            Long reviewCount
    ) {}

    public record WishlistResponse(
            List<WishlistItemResponse> items,
            int totalItems
    ) {}
}
