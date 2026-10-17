package com.shopnest.ecommerce.controller;

import com.shopnest.ecommerce.dto.CouponDtos.OfferResponse;
import com.shopnest.ecommerce.dto.SupportDtos.*;
import com.shopnest.ecommerce.service.CouponService;
import com.shopnest.ecommerce.service.SupportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Public, unauthenticated endpoints that are not part of the catalogue. */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SupportController {

    private final SupportService supportService;
    private final CouponService couponService;

    @PostMapping("/newsletter")
    public ResponseEntity<MessageResponse> subscribe(@Valid @RequestBody SubscribeRequest request) {
        return ResponseEntity.ok(supportService.subscribe(request));
    }

    @PostMapping("/contact")
    public ResponseEntity<MessageResponse> contact(@Valid @RequestBody ContactRequest request) {
        return ResponseEntity.ok(supportService.contact(request));
    }

    /** Promo codes currently open to everyone, for the cart's "available offers". */
    @GetMapping("/coupons/offers")
    public ResponseEntity<List<OfferResponse>> offers() {
        return ResponseEntity.ok(couponService.offers());
    }
}
