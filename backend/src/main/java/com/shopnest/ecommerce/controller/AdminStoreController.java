package com.shopnest.ecommerce.controller;

import com.shopnest.ecommerce.dto.CouponDtos.*;
import com.shopnest.ecommerce.dto.SupportDtos.*;
import com.shopnest.ecommerce.service.CouponService;
import com.shopnest.ecommerce.service.SupportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** Admin tools beyond products and orders: coupons, customers and the contact inbox. */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminStoreController {

    private final CouponService couponService;
    private final SupportService supportService;

    // ---------- coupons ----------

    @GetMapping("/coupons")
    public ResponseEntity<List<CouponResponse>> coupons() {
        return ResponseEntity.ok(couponService.all());
    }

    @PostMapping("/coupons")
    public ResponseEntity<CouponResponse> createCoupon(@Valid @RequestBody CouponRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(couponService.create(request));
    }

    @PutMapping("/coupons/{id}")
    public ResponseEntity<CouponResponse> updateCoupon(@PathVariable Long id,
                                                       @Valid @RequestBody CouponRequest request) {
        return ResponseEntity.ok(couponService.update(id, request));
    }

    @DeleteMapping("/coupons/{id}")
    public ResponseEntity<Void> deleteCoupon(@PathVariable Long id) {
        couponService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ---------- customers ----------

    @GetMapping("/customers")
    public ResponseEntity<List<CustomerResponse>> customers() {
        return ResponseEntity.ok(supportService.customers());
    }

    @GetMapping("/subscribers")
    public ResponseEntity<List<SubscriberResponse>> subscribers() {
        return ResponseEntity.ok(supportService.subscribers());
    }

    // ---------- contact inbox ----------

    @GetMapping("/messages")
    public ResponseEntity<List<ContactMessageResponse>> messages() {
        return ResponseEntity.ok(supportService.messages());
    }

    @PutMapping("/messages/{id}")
    public ResponseEntity<ContactMessageResponse> resolve(@PathVariable Long id,
                                                          @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(supportService.setResolved(id, Boolean.TRUE.equals(body.get("resolved"))));
    }
}
