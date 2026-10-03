package com.shopnest.ecommerce.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class ReviewDtos {

    public record ReviewRequest(
            @NotNull @Min(1) @Max(5) Integer rating,
            @Size(max = 1000) String comment
    ) {}

    public record ReviewResponse(
            Long id,
            Long userId,
            String userName,
            Integer rating,
            String comment,
            Boolean verifiedPurchase,
            LocalDateTime createdAt
    ) {}

    /**
     * Everything the product page needs in one call: the list, the average,
     * the star histogram, and the caller's own review if they have one.
     */
    public record ReviewSummaryResponse(
            Long productId,
            Double averageRating,
            long reviewCount,
            /** star value (1-5) -> how many reviews gave it */
            Map<Integer, Long> distribution,
            ReviewResponse myReview,
            boolean canReview,
            List<ReviewResponse> reviews
    ) {}
}
