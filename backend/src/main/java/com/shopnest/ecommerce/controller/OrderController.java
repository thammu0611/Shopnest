package com.shopnest.ecommerce.controller;

import com.shopnest.ecommerce.dto.OrderDtos.*;
import com.shopnest.ecommerce.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /** Converts the signed-in user's cart into an order (mock payment). */
    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout(@AuthenticationPrincipal UserDetails principal,
                                                  @Valid @RequestBody CheckoutRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.checkout(principal.getUsername(), request));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> myOrders(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(orderService.myOrders(principal.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> myOrder(@AuthenticationPrincipal UserDetails principal,
                                                 @PathVariable Long id) {
        return ResponseEntity.ok(orderService.myOrder(principal.getUsername(), id));
    }

    /** Allowed only while the order has not shipped; puts the stock back. */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancel(@AuthenticationPrincipal UserDetails principal,
                                                @PathVariable Long id) {
        return ResponseEntity.ok(orderService.cancelMyOrder(principal.getUsername(), id));
    }
}
