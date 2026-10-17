package com.shopnest.ecommerce.controller;

import com.shopnest.ecommerce.dto.AddressDtos.*;
import com.shopnest.ecommerce.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/account/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ResponseEntity<List<AddressResponse>> list(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(addressService.list(principal.getUsername()));
    }

    @PostMapping
    public ResponseEntity<AddressResponse> create(@AuthenticationPrincipal UserDetails principal,
                                                  @Valid @RequestBody AddressRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(addressService.create(principal.getUsername(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AddressResponse> update(@AuthenticationPrincipal UserDetails principal,
                                                  @PathVariable Long id,
                                                  @Valid @RequestBody AddressRequest request) {
        return ResponseEntity.ok(addressService.update(principal.getUsername(), id, request));
    }

    @PutMapping("/{id}/default")
    public ResponseEntity<AddressResponse> makeDefault(@AuthenticationPrincipal UserDetails principal,
                                                       @PathVariable Long id) {
        return ResponseEntity.ok(addressService.makeDefault(principal.getUsername(), id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserDetails principal, @PathVariable Long id) {
        addressService.delete(principal.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}
