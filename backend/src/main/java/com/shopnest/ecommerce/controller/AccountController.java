package com.shopnest.ecommerce.controller;

import com.shopnest.ecommerce.dto.AccountDtos.*;
import com.shopnest.ecommerce.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/account")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @GetMapping
    public ResponseEntity<AccountResponse> profile(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(accountService.profile(principal.getUsername()));
    }

    @PutMapping
    public ResponseEntity<AccountResponse> update(@AuthenticationPrincipal UserDetails principal,
                                                  @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(accountService.updateProfile(principal.getUsername(), request));
    }

    @PutMapping("/password")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody ChangePasswordRequest request) {
        accountService.changePassword(principal.getUsername(), request);
        return ResponseEntity.ok(Map.of("message", "Password updated"));
    }
}
