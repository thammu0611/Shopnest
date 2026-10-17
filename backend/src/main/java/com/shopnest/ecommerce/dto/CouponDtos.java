package com.shopnest.ecommerce.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CouponDtos {

    public record ApplyCouponRequest(@NotBlank @Size(max = 30) String code) {}

    /** What shoppers see in the "available offers" list. */
    public record OfferResponse(
            String code,
            String description,
            String discountType,
            BigDecimal value,
            BigDecimal minOrderAmount,
            BigDecimal maxDiscount,
            LocalDateTime expiresAt
    ) {}

    public record CouponRequest(
            @NotBlank @Size(max = 30) @Pattern(regexp = "^[A-Za-z0-9_-]+$", message = "letters, digits, - and _ only")
            String code,
            @Size(max = 200) String description,
            @NotBlank String discountType,      // PERCENT | FLAT
            @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal value,
            @DecimalMin("0.0") BigDecimal minOrderAmount,
            @DecimalMin(value = "0.0", inclusive = false) BigDecimal maxDiscount,
            LocalDateTime expiresAt,
            @Min(1) Integer usageLimit,
            Boolean oncePerCustomer,
            Boolean active
    ) {}

    public record CouponResponse(
            Long id,
            String code,
            String description,
            String discountType,
            BigDecimal value,
            BigDecimal minOrderAmount,
            BigDecimal maxDiscount,
            LocalDateTime expiresAt,
            Integer usageLimit,
            Integer usedCount,
            Boolean oncePerCustomer,
            Boolean active,
            LocalDateTime createdAt
    ) {}
}
