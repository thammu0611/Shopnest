package com.shopnest.ecommerce.repository;

import com.shopnest.ecommerce.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    @Query("SELECT c FROM CartItem c JOIN FETCH c.product p LEFT JOIN FETCH p.category WHERE c.user.id = :userId ORDER BY c.id")
    List<CartItem> findByUserId(@Param("userId") Long userId);

    Optional<CartItem> findByUserIdAndProductId(Long userId, Long productId);

    void deleteByUserId(Long userId);
}
