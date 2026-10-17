package com.shopnest.ecommerce.controller;

import com.shopnest.ecommerce.dto.ProductDtos.*;
import com.shopnest.ecommerce.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    /** Public catalogue with search, filters, sorting and pagination. */
    @GetMapping
    public ResponseEntity<Page<ProductResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Double minRating,
            @RequestParam(defaultValue = "false") boolean inStock,
            @RequestParam(defaultValue = "false") boolean onSale,
            @RequestParam(defaultValue = "false") boolean featured,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "latest") String sort) {
        ProductFilter filter = new ProductFilter(search, categoryId, brand, minPrice, maxPrice,
                minRating, inStock, onSale, featured);
        return ResponseEntity.ok(productService.list(filter, page, size, sort));
    }

    /** Price bounds and brand list for the shop filter panel. */
    @GetMapping("/facets")
    public ResponseEntity<CatalogFacets> facets() {
        return ResponseEntity.ok(productService.facets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(productService.get(id));
    }

    @GetMapping("/{id}/related")
    public ResponseEntity<List<ProductResponse>> related(@PathVariable Long id,
                                                         @RequestParam(defaultValue = "4") int limit) {
        return ResponseEntity.ok(productService.related(id, limit));
    }

    @PostMapping
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> update(@PathVariable Long id,
                                                  @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
