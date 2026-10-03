package com.shopnest.ecommerce.service;

import com.shopnest.ecommerce.dto.AccountDtos.*;
import com.shopnest.ecommerce.entity.User;
import com.shopnest.ecommerce.exception.ApiExceptions.BadRequestException;
import com.shopnest.ecommerce.exception.ApiExceptions.ResourceNotFoundException;
import com.shopnest.ecommerce.repository.OrderRepository;
import com.shopnest.ecommerce.repository.ReviewRepository;
import com.shopnest.ecommerce.repository.UserRepository;
import com.shopnest.ecommerce.repository.WishlistItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final WishlistItemRepository wishlistRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public AccountResponse profile(String email) {
        return toResponse(currentUser(email));
    }

    @Transactional
    public AccountResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = currentUser(email);
        user.setName(request.name().trim());

        String phone = request.phone() == null ? null : request.phone().trim();
        user.setPhone(phone == null || phone.isEmpty() ? null : phone);

        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = currentUser(email);

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new BadRequestException("Your current password is not correct");
        }
        if (passwordEncoder.matches(request.newPassword(), user.getPassword())) {
            throw new BadRequestException("The new password must be different from the current one");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    // ---------- helpers ----------

    private User currentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private AccountResponse toResponse(User user) {
        BigDecimal spent = orderRepository.totalSpentByUser(user.getId());
        return new AccountResponse(
                user.getId(), user.getName(), user.getEmail(), user.getPhone(),
                user.getRole().name(), user.getCreatedAt(),
                orderRepository.countByUserId(user.getId()),
                spent == null ? BigDecimal.ZERO : spent,
                wishlistRepository.countByUserId(user.getId()),
                reviewRepository.countByUserId(user.getId()));
    }
}
