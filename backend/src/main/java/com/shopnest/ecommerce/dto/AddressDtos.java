package com.shopnest.ecommerce.dto;

import jakarta.validation.constraints.*;

public class AddressDtos {

    public record AddressRequest(
            @NotBlank @Size(max = 30) String label,
            @NotBlank @Size(max = 100) String fullName,
            @NotBlank @Pattern(regexp = "^[0-9+\\- ]{8,20}$", message = "invalid phone number") String phone,
            @NotBlank @Size(max = 200) String line1,
            @Size(max = 200) String line2,
            @NotBlank @Size(max = 80) String city,
            @NotBlank @Size(max = 80) String state,
            @NotBlank @Pattern(regexp = "^[0-9]{4,10}$", message = "invalid pincode") String pincode,
            Boolean makeDefault
    ) {}

    public record AddressResponse(
            Long id,
            String label,
            String fullName,
            String phone,
            String line1,
            String line2,
            String city,
            String state,
            String pincode,
            boolean isDefault
    ) {}
}
