package com.shopnest.ecommerce.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class SupportDtos {

    public record SubscribeRequest(@NotBlank @Email @Size(max = 150) String email) {}

    public record ContactRequest(
            @NotBlank @Size(max = 100) String name,
            @NotBlank @Email @Size(max = 150) String email,
            @NotBlank @Size(max = 150) String subject,
            @NotBlank @Size(min = 10, max = 2000) String message,
            @Size(max = 40) String orderNumber
    ) {}

    public record ContactMessageResponse(
            Long id, String name, String email, String subject, String message,
            String orderNumber, boolean resolved, LocalDateTime createdAt
    ) {}

    public record SubscriberResponse(Long id, String email, LocalDateTime subscribedAt) {}

    public record CustomerResponse(
            Long id, String name, String email, String phone, String role,
            LocalDateTime memberSince, long orderCount, BigDecimal totalSpent
    ) {}

    public record MessageResponse(String message) {}
}
