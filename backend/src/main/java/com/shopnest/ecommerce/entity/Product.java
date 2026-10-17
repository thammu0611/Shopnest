package com.shopnest.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    /** Original / list price. When it is above {@link #price} the product is shown as on sale. */
    @Column(precision = 12, scale = 2)
    private BigDecimal mrp;

    @Column(length = 80)
    private String brand;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    /** Extra gallery shots shown on the product page, after the main image. */
    @ElementCollection(fetch = FetchType.LAZY)
    @org.hibernate.annotations.BatchSize(size = 50)
    @CollectionTable(name = "product_images",
                     joinColumns = @JoinColumn(name = "product_id"),
                     foreignKey = @ForeignKey(name = "fk_product_images_product"))
    @OrderColumn(name = "position")
    @Column(name = "url", length = 500)
    @Builder.Default
    private List<String> images = new ArrayList<>();

    /** Hand-picked for the home page. Nullable so existing rows migrate cleanly. */
    @Column
    @Builder.Default
    private Boolean featured = false;

    /** Units sold across non-cancelled orders; backs the "best selling" sort. */
    @Column(name = "sold_count")
    @Builder.Default
    private Integer soldCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer stock = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", foreignKey = @ForeignKey(name = "fk_product_category"))
    private Category category;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
