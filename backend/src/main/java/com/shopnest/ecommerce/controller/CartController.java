package com.shopnest.ecommerce.controller;

import com.shopnest.ecommerce.dto.CartDtos.*;
import com.shopnest.ecommerce.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(cartService.getCart(principal.getUsername()));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> add(@AuthenticationPrincipal UserDetails principal,
                                            @Valid @RequestBody AddToCartRequest request) {
        return ResponseEntity.ok(cartService.addToCart(principal.getUsername(), request));
    }

    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<CartResponse> update(@AuthenticationPrincipal UserDetails principal,
                                               @PathVariable Long cartItemId,
                                               @Valid @RequestBody UpdateCartRequest request) {
        return ResponseEntity.ok(cartService.updateQuantity(principal.getUsername(), cartItemId, request));
    }

    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<CartResponse> remove(@AuthenticationPrincipal UserDetails principal,
                                               @PathVariable Long cartItemId) {
        return ResponseEntity.ok(cartService.removeItem(principal.getUsername(), cartItemId));
    }

    @DeleteMapping
    public ResponseEntity<CartResponse> clear(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(cartService.clear(principal.getUsername()));
    }
}
