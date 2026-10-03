package com.shopnest.ecommerce.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public class ProductDtos {

    public record ProductResponse(
            Long id,
            String name,
            String description,
            BigDecimal price,
            String imageUrl,
            Integer stock,
            Boolean active,
            Long categoryId,
            String categoryName,
            Double averageRating,
            Long reviewCount
    ) {}

    public record ProductRequest(
            @NotBlank @Size(max = 150) String name,
            @Size(max = 2000) String description,
            @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal price,
            @Size(max = 500) String imageUrl,
            @NotNull @Min(0) Integer stock,
            Boolean active,
            Long categoryId
    ) {}

    public record CategoryResponse(Long id, String name, String description) {}

    public record CategoryRequest(
            @NotBlank @Size(max = 80) String name,
            @Size(max = 255) String description
    ) {}
}
