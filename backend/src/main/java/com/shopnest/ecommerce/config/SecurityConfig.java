package com.shopnest.ecommerce.config;

import com.shopnest.ecommerce.security.JwtAuthEntryPoint;
import com.shopnest.ecommerce.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthEntryPoint jwtAuthEntryPoint;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(eh -> eh.authenticationEntryPoint(jwtAuthEntryPoint))
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/products/**", "/api/categories/**").permitAll()
                    .requestMatchers("/error", "/actuator/health").permitAll()
                    // Reviews live under /api/products/{id}/reviews, so they must be
                    // matched BEFORE the admin-only product write rules below -
                    // otherwise posting a review would demand ROLE_ADMIN.
                    .requestMatchers(HttpMethod.POST, "/api/products/*/reviews").authenticated()
                    .requestMatchers(HttpMethod.DELETE, "/api/products/*/reviews/**").authenticated()
                    .requestMatchers(HttpMethod.POST, "/api/products/**", "/api/categories/**").hasAuthority("ROLE_ADMIN")
                    .requestMatchers(HttpMethod.PUT, "/api/products/**", "/api/categories/**").hasAuthority("ROLE_ADMIN")
                    .requestMatchers(HttpMethod.DELETE, "/api/products/**", "/api/categories/**").hasAuthority("ROLE_ADMIN")
                    .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
                    .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.stream(allowedOrigins.split(",")).map(String::trim).toList());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration cfg) throws Exception {
        return cfg.getAuthenticationManager();
    }
}
