package com.shopnest.ecommerce.dto;

import jakarta.validation.constraints.*;

public class AuthDtos {

    public record RegisterRequest(
            @NotBlank @Size(min = 2, max = 100) String name,
            @NotBlank @Email @Size(max = 150) String email,
            @NotBlank @Size(min = 6, max = 72) String password,
            @Size(max = 20) String phone
    ) {}

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password
    ) {}

    public record AuthResponse(
            String token,
            String tokenType,
            UserResponse user
    ) {}

    public record UserResponse(
            Long id,
            String name,
            String email,
            String phone,
            String role
    ) {}
}
