package com.shopnest.ecommerce.repository;

import com.shopnest.ecommerce.entity.OrderEntity;
import com.shopnest.ecommerce.entity.OrderStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<OrderEntity, Long> {

    List<OrderEntity> findByUserIdOrderByIdDesc(Long userId);
    Optional<OrderEntity> findByIdAndUserId(Long id, Long userId);
    List<OrderEntity> findAllByOrderByIdDesc();

    // ---------- account summary ----------

    long countByUserId(Long userId);

    @Query("""
           SELECT COALESCE(SUM(o.totalAmount), 0) FROM OrderEntity o
           WHERE o.user.id = :userId AND o.status <> com.shopnest.ecommerce.entity.OrderStatus.CANCELLED
           """)
    BigDecimal totalSpentByUser(@Param("userId") Long userId);

    /** Backs the "verified purchase" flag on a review. */
    @Query("""
           SELECT COUNT(i) > 0 FROM OrderItem i
           WHERE i.order.user.id = :userId
             AND i.product.id = :productId
             AND i.order.status <> com.shopnest.ecommerce.entity.OrderStatus.CANCELLED
           """)
    boolean hasPurchased(@Param("userId") Long userId, @Param("productId") Long productId);

    // ---------- admin dashboard ----------

    @Query("""
           SELECT COALESCE(SUM(o.totalAmount), 0) FROM OrderEntity o
           WHERE o.status <> com.shopnest.ecommerce.entity.OrderStatus.CANCELLED
           """)
    BigDecimal totalRevenue();

    long countByStatus(OrderStatus status);

    /** Each row is [productId, productName, imageUrl, unitsSold, revenue]. */
    @Query("""
           SELECT i.product.id, i.productName, i.imageUrl,
                  SUM(i.quantity), SUM(i.unitPrice * i.quantity)
           FROM OrderItem i
           WHERE i.order.status <> com.shopnest.ecommerce.entity.OrderStatus.CANCELLED
             AND i.product.id IS NOT NULL
           GROUP BY i.product.id, i.productName, i.imageUrl
           ORDER BY SUM(i.quantity) DESC
           """)
    List<Object[]> topSellers(Pageable pageable);
}
