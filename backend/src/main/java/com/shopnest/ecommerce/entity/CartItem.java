package com.shopnest.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cart_items",
       uniqueConstraints = @UniqueConstraint(name = "uk_cart_user_product",
                                             columnNames = {"user_id", "product_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "fk_cart_user"))
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", foreignKey = @ForeignKey(name = "fk_cart_product"))
    private Product product;

    @Column(nullable = false)
    private Integer quantity;
}
