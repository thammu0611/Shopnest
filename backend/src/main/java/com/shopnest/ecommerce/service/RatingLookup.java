package com.shopnest.ecommerce.service;

import com.shopnest.ecommerce.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

/**
 * Batch rating lookup. Product listings need an average and a count per row;
 * doing that per product would be an N+1, so callers fetch the whole batch in
 * one query and read it back out of the returned map.
 */
@Component
@RequiredArgsConstructor
public class RatingLookup {

    /** Average stars and number of reviews for one product. */
    public record Rating(Double average, Long count) {
        static final Rating NONE = new Rating(null, 0L);
    }

    private final ReviewRepository reviewRepository;

    public Map<Long, Rating> forProducts(Collection<Long> productIds) {
        Map<Long, Rating> result = new HashMap<>();
        if (productIds == null || productIds.isEmpty()) return result;

        for (Object[] row : reviewRepository.aggregateByProductIds(productIds)) {
            Long productId = ((Number) row[0]).longValue();
            double average = ((Number) row[1]).doubleValue();
            long count = ((Number) row[2]).longValue();
            // one decimal place is all the UI shows
            result.put(productId, new Rating(Math.round(average * 10d) / 10d, count));
        }
        return result;
    }

    public Rating forProduct(Long productId) {
        return forProducts(java.util.List.of(productId)).getOrDefault(productId, Rating.NONE);
    }

    public static Rating orNone(Map<Long, Rating> map, Long productId) {
        return map.getOrDefault(productId, Rating.NONE);
    }
}
