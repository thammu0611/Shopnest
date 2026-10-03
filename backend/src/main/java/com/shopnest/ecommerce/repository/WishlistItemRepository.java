package com.shopnest.ecommerce.repository;

import com.shopnest.ecommerce.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {

    @Query("""
           SELECT w FROM WishlistItem w
           JOIN FETCH w.product p
           LEFT JOIN FETCH p.category
           WHERE w.user.id = :userId
           ORDER BY w.id DESC
           """)
    List<WishlistItem> findByUserId(@Param("userId") Long userId);

    Optional<WishlistItem> findByUserIdAndProductId(Long userId, Long productId);

    boolean existsByUserIdAndProductId(Long userId, Long productId);

    long countByUserId(Long userId);

    @Query("SELECT w.product.id FROM WishlistItem w WHERE w.user.id = :userId")
    List<Long> findProductIdsByUserId(@Param("userId") Long userId);
}
