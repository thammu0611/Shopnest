package com.shopnest.ecommerce.service;

import com.shopnest.ecommerce.dto.ReviewDtos.*;
import com.shopnest.ecommerce.entity.Product;
import com.shopnest.ecommerce.entity.Review;
import com.shopnest.ecommerce.entity.User;
import com.shopnest.ecommerce.exception.ApiExceptions.ResourceNotFoundException;
import com.shopnest.ecommerce.repository.OrderRepository;
import com.shopnest.ecommerce.repository.ProductRepository;
import com.shopnest.ecommerce.repository.ReviewRepository;
import com.shopnest.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    /**
     * @param email the signed-in user, or null for an anonymous visitor -
     *              anonymous callers simply get no "my review" and cannot post.
     */
    @Transactional(readOnly = true)
    public ReviewSummaryResponse summary(Long productId, String email) {
        Product product = findProduct(productId);
        List<Review> reviews = reviewRepository.findByProductId(product.getId());

        Map<Integer, Long> distribution = new LinkedHashMap<>();
        for (int star = 5; star >= 1; star--) {
            final int s = star;
            distribution.put(star, reviews.stream().filter(r -> r.getRating() == s).count());
        }

        double average = reviews.stream().mapToInt(Review::getRating).average().orElse(0d);
        Double rounded = reviews.isEmpty() ? null : Math.round(average * 10d) / 10d;

        ReviewResponse mine = null;
        boolean canReview = false;
        if (email != null) {
            User user = userRepository.findByEmail(email).orElse(null);
            if (user != null) {
                mine = reviewRepository.findByUserIdAndProductId(user.getId(), product.getId())
                        .map(ReviewService::toResponse).orElse(null);
                canReview = true;
            }
        }

        return new ReviewSummaryResponse(
                product.getId(), rounded, reviews.size(), distribution, mine, canReview,
                reviews.stream().map(ReviewService::toResponse).toList());
    }

    /** Posting twice edits the existing review instead of adding a second one. */
    @Transactional
    public ReviewSummaryResponse submit(Long productId, String email, ReviewRequest request) {
        Product product = findProduct(productId);
        User user = currentUser(email);

        Review review = reviewRepository.findByUserIdAndProductId(user.getId(), product.getId())
                .orElseGet(() -> Review.builder().user(user).product(product).build());

        review.setRating(request.rating());
        review.setComment(request.comment() == null ? null : request.comment().trim());
        review.setVerifiedPurchase(orderRepository.hasPurchased(user.getId(), product.getId()));

        reviewRepository.save(review);
        return summary(product.getId(), email);
    }

    @Transactional
    public ReviewSummaryResponse deleteMine(Long productId, String email) {
        User user = currentUser(email);
        reviewRepository.findByUserIdAndProductId(user.getId(), productId)
                .ifPresent(reviewRepository::delete);
        return summary(productId, email);
    }

    // ---------- helpers ----------

    private Product findProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product " + id + " not found"));
    }

    private User currentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    static ReviewResponse toResponse(Review r) {
        return new ReviewResponse(
                r.getId(), r.getUser().getId(), r.getUser().getName(),
                r.getRating(), r.getComment(), r.getVerifiedPurchase(), r.getCreatedAt());
    }
}
