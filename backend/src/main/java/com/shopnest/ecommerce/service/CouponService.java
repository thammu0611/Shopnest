package com.shopnest.ecommerce.service;

import com.shopnest.ecommerce.dto.CouponDtos.*;
import com.shopnest.ecommerce.entity.Coupon;
import com.shopnest.ecommerce.entity.DiscountType;
import com.shopnest.ecommerce.entity.OrderStatus;
import com.shopnest.ecommerce.entity.User;
import com.shopnest.ecommerce.exception.ApiExceptions.BadRequestException;
import com.shopnest.ecommerce.exception.ApiExceptions.DuplicateResourceException;
import com.shopnest.ecommerce.exception.ApiExceptions.ResourceNotFoundException;
import com.shopnest.ecommerce.repository.CouponRepository;
import com.shopnest.ecommerce.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

/**
 * Promo codes. {@link #evaluate} is the single place that decides whether a
 * code applies and how much it is worth, so the cart preview and checkout can
 * never disagree.
 */
@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;
    private final OrderRepository orderRepository;

    /** Outcome of checking a code against a cart. message is null when valid. */
    public record Evaluation(Coupon coupon, BigDecimal discount, String message) {
        public boolean valid() { return message == null; }
    }

    @Transactional(readOnly = true)
    public Evaluation evaluate(String code, BigDecimal subtotal, User user) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code.trim()).orElse(null);
        if (coupon == null || !Boolean.TRUE.equals(coupon.getActive())) {
            return invalid(coupon, "Code " + code.toUpperCase(Locale.ROOT) + " is not valid");
        }
        if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(LocalDateTime.now())) {
            return invalid(coupon, "Code " + coupon.getCode() + " has expired");
        }
        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            return invalid(coupon, "Code " + coupon.getCode() + " has been fully redeemed");
        }
        if (Boolean.TRUE.equals(coupon.getOncePerCustomer()) && user != null
                && orderRepository.existsByUserIdAndCouponCodeIgnoreCaseAndStatusNot(
                        user.getId(), coupon.getCode(), OrderStatus.CANCELLED)) {
            return invalid(coupon, "You have already used " + coupon.getCode());
        }
        if (coupon.getMinOrderAmount() != null && subtotal.compareTo(coupon.getMinOrderAmount()) < 0) {
            BigDecimal shortBy = coupon.getMinOrderAmount().subtract(subtotal);
            return invalid(coupon, "Add " + rupees(shortBy) + " more to use " + coupon.getCode());
        }

        BigDecimal discount = coupon.getDiscountType() == DiscountType.PERCENT
                ? subtotal.multiply(coupon.getValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
                : coupon.getValue();
        if (coupon.getMaxDiscount() != null) discount = discount.min(coupon.getMaxDiscount());
        discount = discount.min(subtotal).setScale(2, RoundingMode.HALF_UP);

        return new Evaluation(coupon, discount, null);
    }

    /** Shopper-facing list of codes that can currently be redeemed. */
    @Transactional(readOnly = true)
    public List<OfferResponse> offers() {
        LocalDateTime now = LocalDateTime.now();
        return couponRepository.findByActiveTrueOrderByIdAsc().stream()
                .filter(c -> c.getExpiresAt() == null || c.getExpiresAt().isAfter(now))
                .filter(c -> c.getUsageLimit() == null || c.getUsedCount() < c.getUsageLimit())
                .map(c -> new OfferResponse(c.getCode(), c.getDescription(), c.getDiscountType().name(),
                        c.getValue(), c.getMinOrderAmount(), c.getMaxDiscount(), c.getExpiresAt()))
                .toList();
    }

    @Transactional
    public void recordRedemption(Coupon coupon) {
        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);
    }

    /** A cancelled order gives its redemption back. */
    @Transactional
    public void releaseRedemption(String code) {
        if (code == null) return;
        couponRepository.findByCodeIgnoreCase(code).ifPresent(c -> {
            c.setUsedCount(Math.max(0, c.getUsedCount() - 1));
            couponRepository.save(c);
        });
    }

    // ---------- admin ----------

    @Transactional(readOnly = true)
    public List<CouponResponse> all() {
        return couponRepository.findAllByOrderByIdDesc().stream().map(CouponService::toResponse).toList();
    }

    @Transactional
    public CouponResponse create(CouponRequest request) {
        String code = request.code().trim().toUpperCase(Locale.ROOT);
        if (couponRepository.existsByCodeIgnoreCase(code)) {
            throw new DuplicateResourceException("Coupon " + code + " already exists");
        }
        Coupon coupon = new Coupon();
        coupon.setUsedCount(0);
        apply(coupon, request, code);
        return toResponse(couponRepository.save(coupon));
    }

    @Transactional
    public CouponResponse update(Long id, CouponRequest request) {
        Coupon coupon = find(id);
        String code = request.code().trim().toUpperCase(Locale.ROOT);
        couponRepository.findByCodeIgnoreCase(code)
                .filter(other -> !other.getId().equals(id))
                .ifPresent(other -> { throw new DuplicateResourceException("Coupon " + code + " already exists"); });
        apply(coupon, request, code);
        return toResponse(couponRepository.save(coupon));
    }

    @Transactional
    public void delete(Long id) {
        couponRepository.delete(find(id));
    }

    // ---------- helpers ----------

    private void apply(Coupon coupon, CouponRequest request, String code) {
        DiscountType type;
        try {
            type = DiscountType.valueOf(request.discountType().trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Discount type must be PERCENT or FLAT");
        }
        if (type == DiscountType.PERCENT && request.value().compareTo(BigDecimal.valueOf(90)) > 0) {
            throw new BadRequestException("A percentage discount cannot exceed 90%");
        }
        coupon.setCode(code);
        coupon.setDescription(request.description());
        coupon.setDiscountType(type);
        coupon.setValue(request.value());
        coupon.setMinOrderAmount(request.minOrderAmount());
        coupon.setMaxDiscount(type == DiscountType.PERCENT ? request.maxDiscount() : null);
        coupon.setExpiresAt(request.expiresAt());
        coupon.setUsageLimit(request.usageLimit());
        coupon.setOncePerCustomer(Boolean.TRUE.equals(request.oncePerCustomer()));
        coupon.setActive(request.active() == null || request.active());
    }

    private Coupon find(Long id) {
        return couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon " + id + " not found"));
    }

    private static Evaluation invalid(Coupon coupon, String message) {
        return new Evaluation(coupon, BigDecimal.ZERO, message);
    }

    private static String rupees(BigDecimal amount) {
        NumberFormat format = NumberFormat.getCurrencyInstance(Locale.forLanguageTag("en-IN"));
        return format.format(amount);
    }

    static CouponResponse toResponse(Coupon c) {
        return new CouponResponse(c.getId(), c.getCode(), c.getDescription(), c.getDiscountType().name(),
                c.getValue(), c.getMinOrderAmount(), c.getMaxDiscount(), c.getExpiresAt(),
                c.getUsageLimit(), c.getUsedCount(), c.getOncePerCustomer(), c.getActive(), c.getCreatedAt());
    }
}
