package com.shopnest.ecommerce.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AccountDtos {

    public record UpdateProfileRequest(
            @NotBlank @Size(min = 2, max = 100) String name,
            @Size(max = 20)
            @Pattern(regexp = "^$|^[0-9+\\- ]{8,20}$", message = "invalid phone number")
            String phone
    ) {}

    public record ChangePasswordRequest(
            @NotBlank String currentPassword,
            @NotBlank @Size(min = 6, max = 72) String newPassword
    ) {}

    public record AccountResponse(
            Long id,
            String name,
            String email,
            String phone,
            String role,
            LocalDateTime memberSince,
            long orderCount,
            BigDecimal totalSpent,
            long wishlistCount,
            long reviewCount
    ) {}
}
