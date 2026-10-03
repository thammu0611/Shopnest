package com.shopnest.ecommerce.service;

import com.shopnest.ecommerce.dto.AuthDtos.*;
import com.shopnest.ecommerce.entity.Role;
import com.shopnest.ecommerce.entity.User;
import com.shopnest.ecommerce.exception.ApiExceptions.DuplicateResourceException;
import com.shopnest.ecommerce.exception.ApiExceptions.ResourceNotFoundException;
import com.shopnest.ecommerce.repository.UserRepository;
import com.shopnest.ecommerce.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("An account with " + email + " already exists");
        }

        User user = userRepository.save(User.builder()
                .name(request.name().trim())
                .email(email)
                .password(passwordEncoder.encode(request.password()))
                .phone(request.phone())
                .role(Role.ROLE_USER)
                .build());

        return buildAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();

        // Throws AuthenticationException -> handled as 401 by GlobalExceptionHandler
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.password()));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return buildAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse currentUser(String email) {
        return toResponse(userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found")));
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtService.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        return new AuthResponse(token, "Bearer", toResponse(user));
    }

    public static UserResponse toResponse(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(),
                                user.getPhone(), user.getRole().name());
    }
}
