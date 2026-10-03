package com.shopnest.ecommerce.service;

import com.shopnest.ecommerce.dto.CartDtos.AddToCartRequest;
import com.shopnest.ecommerce.dto.CartDtos.CartResponse;
import com.shopnest.ecommerce.dto.WishlistDtos.*;
import com.shopnest.ecommerce.entity.Product;
import com.shopnest.ecommerce.entity.User;
import com.shopnest.ecommerce.entity.WishlistItem;
import com.shopnest.ecommerce.exception.ApiExceptions.BadRequestException;
import com.shopnest.ecommerce.exception.ApiExceptions.ResourceNotFoundException;
import com.shopnest.ecommerce.repository.ProductRepository;
import com.shopnest.ecommerce.repository.UserRepository;
import com.shopnest.ecommerce.repository.WishlistItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistItemRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final RatingLookup ratingLookup;
    private final CartService cartService;

    @Transactional(readOnly = true)
    public WishlistResponse getWishlist(String email) {
        return build(wishlistRepository.findByUserId(currentUser(email).getId()));
    }

    /** Which of the caller's products are wishlisted - drives the heart icons. */
    @Transactional(readOnly = true)
    public List<Long> wishlistedProductIds(String email) {
        return wishlistRepository.findProductIdsByUserId(currentUser(email).getId());
    }

    /** Adding something already saved is a no-op rather than an error. */
    @Transactional
    public WishlistResponse add(String email, Long productId) {
        User user = currentUser(email);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!Boolean.TRUE.equals(product.getActive())) {
            throw new BadRequestException("This product is no longer available");
        }

        if (!wishlistRepository.existsByUserIdAndProductId(user.getId(), product.getId())) {
            wishlistRepository.save(WishlistItem.builder().user(user).product(product).build());
        }
        return build(wishlistRepository.findByUserId(user.getId()));
    }

    @Transactional
    public WishlistResponse remove(String email, Long productId) {
        User user = currentUser(email);
        wishlistRepository.findByUserIdAndProductId(user.getId(), productId)
                .ifPresent(wishlistRepository::delete);
        return build(wishlistRepository.findByUserId(user.getId()));
    }

    /**
     * Saved item -> cart. The cart add runs first so that a stock or
     * availability failure leaves the wishlist untouched.
     */
    @Transactional
    public CartResponse moveToCart(String email, Long productId) {
        User user = currentUser(email);
        if (!wishlistRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            throw new ResourceNotFoundException("That product is not in your wishlist");
        }

        CartResponse cart = cartService.addToCart(email, new AddToCartRequest(productId, 1));
        wishlistRepository.findByUserIdAndProductId(user.getId(), productId)
                .ifPresent(wishlistRepository::delete);
        return cart;
    }

    // ---------- helpers ----------

    private User currentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private WishlistResponse build(List<WishlistItem> items) {
        var ratings = ratingLookup.forProducts(
                items.stream().map(w -> w.getProduct().getId()).toList());

        List<WishlistItemResponse> lines = items.stream().map(w -> {
            Product p = w.getProduct();
            var rating = RatingLookup.orNone(ratings, p.getId());
            return new WishlistItemResponse(
                    w.getId(), p.getId(), p.getName(), p.getImageUrl(), p.getPrice(),
                    p.getStock(), p.getActive(),
                    p.getCategory() != null ? p.getCategory().getName() : null,
                    rating.average(), rating.count());
        }).toList();

        return new WishlistResponse(lines, lines.size());
    }
}
