package com.shopnest.ecommerce.repository;

import com.shopnest.ecommerce.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("""
           SELECT p FROM Product p
           WHERE p.active = true
             AND (:categoryId IS NULL OR p.category.id = :categoryId)
             AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))
                                  OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))
           """)
    Page<Product> search(@Param("search") String search,
                         @Param("categoryId") Long categoryId,
                         Pageable pageable);

    /** Admin view - includes deactivated products so they can be restored. */
    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.category ORDER BY p.id DESC")
    java.util.List<Product> findAllForAdmin();
}
