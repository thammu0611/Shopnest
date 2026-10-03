package com.shopnest.ecommerce.config;

import com.shopnest.ecommerce.entity.*;
import com.shopnest.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * Inserts demo categories, products and two accounts the first time the app
 * starts against an empty database. Safe to leave on - it checks counts first.
 */
@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUsers();
        seedCatalog();
        seedReviews();
    }

    private void seedUsers() {
        if (!userRepository.existsByEmail("admin@shopnest.com")) {
            userRepository.save(User.builder()
                    .name("Store Admin")
                    .email("admin@shopnest.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(Role.ROLE_ADMIN)
                    .phone("9000000001")
                    .build());
            log.info("Seeded admin account -> admin@shopnest.com / Admin@123");
        }
        if (!userRepository.existsByEmail("user@shopnest.com")) {
            userRepository.save(User.builder()
                    .name("Demo Customer")
                    .email("user@shopnest.com")
                    .password(passwordEncoder.encode("User@123"))
                    .role(Role.ROLE_USER)
                    .phone("9000000002")
                    .build());
            log.info("Seeded customer account -> user@shopnest.com / User@123");
        }
    }

    private void seedCatalog() {
        if (productRepository.count() > 0) {
            return;
        }

        Category electronics = category("Electronics", "Phones, audio and everyday gadgets");
        Category fashion     = category("Fashion", "Clothing, footwear and accessories");
        Category home        = category("Home & Kitchen", "Appliances and home essentials");
        Category books       = category("Books", "Technical and general reading");

        List<Product> products = List.of(
            product("Wireless Noise-Cancelling Headphones",
                    "Over-ear Bluetooth 5.3 headphones with 40h battery and hybrid ANC.",
                    "4999.00", 40, electronics,
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80"),
            product("Smart Fitness Band",
                    "AMOLED display, SpO2 and heart-rate tracking, 14-day battery life.",
                    "2299.00", 75, electronics,
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"),
            product("Mechanical Keyboard TKL",
                    "Hot-swappable 87-key board with brown switches and RGB backlight.",
                    "3799.00", 25, electronics,
                    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80"),
            product("1080p Webcam",
                    "Full-HD USB webcam with auto light correction and dual mics.",
                    "1899.00", 30, electronics,
                    "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=600&q=80"),
            product("Cotton Casual Shirt",
                    "Breathable 100% cotton regular-fit shirt, machine washable.",
                    "1199.00", 60, fashion,
                    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80"),
            product("Running Shoes",
                    "Lightweight mesh upper with cushioned EVA midsole.",
                    "2799.00", 45, fashion,
                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80"),
            product("Leather Laptop Backpack",
                    "Water-resistant 18L backpack with padded 15.6\" laptop sleeve.",
                    "2499.00", 35, fashion,
                    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80"),
            product("Stainless Steel Cookware Set",
                    "Five-piece induction-friendly cookware set with glass lids.",
                    "3499.00", 20, home,
                    "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=600&q=80"),
            product("Automatic Coffee Maker",
                    "Drip coffee machine with 1.2L carafe and keep-warm plate.",
                    "4299.00", 18, home,
                    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80"),
            product("LED Study Lamp",
                    "Three-tone dimmable desk lamp with USB charging port.",
                    "999.00", 90, home,
                    "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80"),
            product("Clean Code",
                    "Robert C. Martin's handbook of agile software craftsmanship.",
                    "1450.00", 50, books,
                    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80"),
            product("Spring Boot in Action",
                    "Practical guide to building production-ready Spring Boot services.",
                    "1699.00", 28, books,
                    "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80")
        );

        productRepository.saveAll(products);
        log.info("Seeded {} demo products across {} categories",
                 products.size(), categoryRepository.count());
    }

    /** A few demo ratings so the stars and review list are not empty on day one. */
    private void seedReviews() {
        if (reviewRepository.count() > 0) return;

        User admin = userRepository.findByEmail("admin@shopnest.com").orElse(null);
        User customer = userRepository.findByEmail("user@shopnest.com").orElse(null);
        if (admin == null || customer == null) return;

        List<Product> products = productRepository.findAllForAdmin();
        if (products.isEmpty()) return;

        List<Review> reviews = new java.util.ArrayList<>();
        addReview(reviews, products, 0, customer, 5, "Exactly as described and it arrived quickly. Very happy with it.", true);
        addReview(reviews, products, 0, admin,    4, "Good quality for the price. Would buy again.", false);
        addReview(reviews, products, 1, customer, 5, "Superb build quality - well worth the money.", true);
        addReview(reviews, products, 2, customer, 4, "Does the job nicely, though the manual is a bit thin.", true);
        addReview(reviews, products, 3, customer, 3, "Decent, but I expected a little more at this price.", true);
        addReview(reviews, products, 4, admin,    5, "Brilliant - it has become part of my daily routine.", false);
        addReview(reviews, products, 5, customer, 4, "Comfortable and sturdy. Happy with the purchase.", true);

        reviewRepository.saveAll(reviews);
        log.info("Seeded {} demo product reviews", reviews.size());
    }

    private void addReview(List<Review> target, List<Product> products, int index,
                           User author, int rating, String comment, boolean verified) {
        if (index >= products.size()) return;
        target.add(Review.builder()
                .product(products.get(index))
                .user(author)
                .rating(rating)
                .comment(comment)
                .verifiedPurchase(verified)
                .build());
    }

    private Category category(String name, String description) {
        return categoryRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> categoryRepository.save(
                        Category.builder().name(name).description(description).build()));
    }

    private Product product(String name, String description, String price,
                            int stock, Category category, String imageUrl) {
        return Product.builder()
                .name(name)
                .description(description)
                .price(new BigDecimal(price))
                .stock(stock)
                .category(category)
                .imageUrl(imageUrl)
                .active(true)
                .build();
    }
}
