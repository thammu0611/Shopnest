package com.shopnest.ecommerce.controller;

import com.shopnest.ecommerce.dto.ReviewDtos.*;
import com.shopnest.ecommerce.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    /** Public: anonymous visitors see the reviews, just not a "your review" block. */
    @GetMapping
    public ResponseEntity<ReviewSummaryResponse> list(@PathVariable Long productId,
                                                      @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(reviewService.summary(
                productId, principal == null ? null : principal.getUsername()));
    }

    @PostMapping
    public ResponseEntity<ReviewSummaryResponse> submit(@PathVariable Long productId,
                                                        @AuthenticationPrincipal UserDetails principal,
                                                        @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.submit(productId, principal.getUsername(), request));
    }

    @DeleteMapping("/mine")
    public ResponseEntity<ReviewSummaryResponse> deleteMine(@PathVariable Long productId,
                                                            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(reviewService.deleteMine(productId, principal.getUsername()));
    }
}
