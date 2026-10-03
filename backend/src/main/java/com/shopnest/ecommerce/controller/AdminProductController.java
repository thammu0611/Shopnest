package com.shopnest.ecommerce.controller;

import com.shopnest.ecommerce.dto.ProductDtos.ProductResponse;
import com.shopnest.ecommerce.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Admin-only catalogue view: shows deactivated products too. */
@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductResponse>> all() {
        return ResponseEntity.ok(productService.listAllForAdmin());
    }
}
