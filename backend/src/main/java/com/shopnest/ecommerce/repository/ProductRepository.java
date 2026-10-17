package com.shopnest.ecommerce.repository;

import com.shopnest.ecommerce.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("""
           SELECT p FROM Product p
           WHERE p.active = true
             AND (:categoryId IS NULL OR p.category.id = :categoryId)
             AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))
                                  OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%'))
                                  OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :search, '%')))
             AND (:brand IS NULL OR LOWER(p.brand) = LOWER(:brand))
             AND (:minPrice IS NULL OR p.price >= :minPrice)
             AND (:maxPrice IS NULL OR p.price <= :maxPrice)
             AND (:inStock = false OR p.stock > 0)
             AND (:onSale = false OR (p.mrp IS NOT NULL AND p.mrp > p.price))
             AND (:featured = false OR p.featured = true)
             AND (:minRating IS NULL
                  OR (SELECT AVG(r.rating) FROM Review r WHERE r.product = p) >= :minRating)
           """)
    Page<Product> search(@Param("search") String search,
                         @Param("categoryId") Long categoryId,
                         @Param("brand") String brand,
                         @Param("minPrice") BigDecimal minPrice,
                         @Param("maxPrice") BigDecimal maxPrice,
                         @Param("minRating") Double minRating,
                         @Param("inStock") boolean inStock,
                         @Param("onSale") boolean onSale,
                         @Param("featured") boolean featured,
                         Pageable pageable);

    /** Admin view - includes deactivated products so they can be restored. */
    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.category ORDER BY p.id DESC")
    List<Product> findAllForAdmin();

    /** Other live products, optionally from one category; callers pass the sort in the pageable. */
    @Query("""
           SELECT p FROM Product p
           WHERE p.active = true AND p.id <> :excludeId
             AND (:categoryId IS NULL OR p.category.id = :categoryId)
           """)
    List<Product> findOthers(@Param("excludeId") Long excludeId,
                             @Param("categoryId") Long categoryId,
                             Pageable pageable);

    /** Each row is [minPrice, maxPrice] over live products. */
    @Query("SELECT MIN(p.price), MAX(p.price) FROM Product p WHERE p.active = true")
    List<Object[]> priceBounds();

    @Query("""
           SELECT DISTINCT p.brand FROM Product p
           WHERE p.active = true AND p.brand IS NOT NULL AND p.brand <> ''
           ORDER BY p.brand
           """)
    List<String> distinctBrands();

    long countByCategoryIdAndActiveTrue(Long categoryId);

    long countByCategoryId(Long categoryId);
}
