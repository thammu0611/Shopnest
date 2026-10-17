package com.shopnest.ecommerce.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class ProductDtos {

    public record ProductResponse(
            Long id,
            String name,
            String description,
            BigDecimal price,
            BigDecimal mrp,
            Integer discountPercent,
            String brand,
            String imageUrl,
            List<String> images,
            Integer stock,
            Boolean active,
            Boolean featured,
            Integer soldCount,
            Long categoryId,
            String categoryName,
            Double averageRating,
            Long reviewCount,
            LocalDateTime createdAt
    ) {}

    public record ProductRequest(
            @NotBlank @Size(max = 150) String name,
            @Size(max = 2000) String description,
            @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal price,
            @DecimalMin(value = "0.0", inclusive = false) BigDecimal mrp,
            @Size(max = 80) String brand,
            @Size(max = 500) String imageUrl,
            @Size(max = 8) List<@Size(max = 500) String> images,
            @NotNull @Min(0) Integer stock,
            Boolean active,
            Boolean featured,
            Long categoryId
    ) {}

    /** Bounds and options for the shop page's filter panel. */
    public record CatalogFacets(
            BigDecimal minPrice,
            BigDecimal maxPrice,
            List<String> brands
    ) {}

    /** Every filter the public catalogue understands. Nulls / false mean "not filtered". */
    public record ProductFilter(
            String search,
            Long categoryId,
            String brand,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Double minRating,
            boolean inStock,
            boolean onSale,
            boolean featured
    ) {}

    public record CategoryResponse(Long id, String name, String description, String imageUrl,
                                   long productCount) {}

    public record CategoryRequest(
            @NotBlank @Size(max = 80) String name,
            @Size(max = 255) String description,
            @Size(max = 500) String imageUrl
    ) {}
}
