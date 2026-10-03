package com.shopnest.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * One review per user per product - the unique constraint enforces it, and
 * posting again updates the existing row rather than creating a second one.
 */
@Entity
@Table(name = "reviews",
       uniqueConstraints = @UniqueConstraint(name = "uk_review_user_product",
                                             columnNames = {"user_id", "product_id"}))
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "fk_review_user"))
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", foreignKey = @ForeignKey(name = "fk_review_product"))
    private Product product;

    /** 1 to 5 stars. */
    @Column(nullable = false)
    private Integer rating;

    @Column(length = 1000)
    private String comment;

    /** True once the reviewer has actually bought this product. */
    @Column(name = "verified_purchase", nullable = false)
    @Builder.Default
    private Boolean verifiedPurchase = false;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
