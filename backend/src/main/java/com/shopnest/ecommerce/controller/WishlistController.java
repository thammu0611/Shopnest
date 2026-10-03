package com.shopnest.ecommerce.controller;

import com.shopnest.ecommerce.dto.CartDtos.CartResponse;
import com.shopnest.ecommerce.dto.WishlistDtos.*;
import com.shopnest.ecommerce.service.WishlistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<WishlistResponse> get(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(wishlistService.getWishlist(principal.getUsername()));
    }

    /** Just the ids, for painting the heart icons on a product grid. */
    @GetMapping("/ids")
    public ResponseEntity<List<Long>> ids(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(wishlistService.wishlistedProductIds(principal.getUsername()));
    }

    @PostMapping
    public ResponseEntity<WishlistResponse> add(@AuthenticationPrincipal UserDetails principal,
                                                @Valid @RequestBody AddToWishlistRequest request) {
        return ResponseEntity.ok(wishlistService.add(principal.getUsername(), request.productId()));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<WishlistResponse> remove(@AuthenticationPrincipal UserDetails principal,
                                                   @PathVariable Long productId) {
        return ResponseEntity.ok(wishlistService.remove(principal.getUsername(), productId));
    }

    @PostMapping("/{productId}/move-to-cart")
    public ResponseEntity<CartResponse> moveToCart(@AuthenticationPrincipal UserDetails principal,
                                                   @PathVariable Long productId) {
        return ResponseEntity.ok(wishlistService.moveToCart(principal.getUsername(), productId));
    }
}
