package com.shopnest.ecommerce.repository;

import com.shopnest.ecommerce.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    @Query("""
           SELECT r FROM Review r
           JOIN FETCH r.user
           WHERE r.product.id = :productId
           ORDER BY r.id DESC
           """)
    List<Review> findByProductId(@Param("productId") Long productId);

    Optional<Review> findByUserIdAndProductId(Long userId, Long productId);

    long countByUserId(Long userId);

    /**
     * Rating aggregate for a batch of products, so a product listing needs one
     * extra query rather than one per row.
     * Each row is [productId, averageRating, reviewCount].
     */
    @Query("""
           SELECT r.product.id, AVG(r.rating), COUNT(r)
           FROM Review r
           WHERE r.product.id IN :productIds
           GROUP BY r.product.id
           """)
    List<Object[]> aggregateByProductIds(@Param("productIds") Collection<Long> productIds);
}
