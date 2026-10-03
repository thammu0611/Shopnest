package com.shopnest.ecommerce.service;

import com.shopnest.ecommerce.dto.DashboardDtos.*;
import com.shopnest.ecommerce.entity.OrderStatus;
import com.shopnest.ecommerce.entity.Product;
import com.shopnest.ecommerce.repository.OrderRepository;
import com.shopnest.ecommerce.repository.ProductRepository;
import com.shopnest.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    /** A product at or below this stock level is flagged on the dashboard. */
    private static final int LOW_STOCK_THRESHOLD = 15;
    private static final int TOP_SELLER_LIMIT = 5;

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public DashboardResponse summary() {
        BigDecimal revenue = orderRepository.totalRevenue();
        if (revenue == null) revenue = BigDecimal.ZERO;

        Map<String, Long> byStatus = new LinkedHashMap<>();
        long countedOrders = 0;
        for (OrderStatus status : OrderStatus.values()) {
            long count = orderRepository.countByStatus(status);
            byStatus.put(status.name(), count);
            if (status != OrderStatus.CANCELLED) countedOrders += count;
        }

        long totalOrders = orderRepository.count();

        BigDecimal averageOrderValue = countedOrders == 0
                ? BigDecimal.ZERO
                : revenue.divide(BigDecimal.valueOf(countedOrders), 2, RoundingMode.HALF_UP);

        List<TopSellerResponse> topSellers = orderRepository
                .topSellers(PageRequest.of(0, TOP_SELLER_LIMIT)).stream()
                .map(row -> new TopSellerResponse(
                        ((Number) row[0]).longValue(),
                        (String) row[1],
                        (String) row[2],
                        ((Number) row[3]).longValue(),
                        toMoney(row[4])))
                .toList();

        List<LowStockResponse> lowStock = productRepository.findAllForAdmin().stream()
                .filter(p -> Boolean.TRUE.equals(p.getActive()))
                .filter(p -> p.getStock() != null && p.getStock() <= LOW_STOCK_THRESHOLD)
                .sorted(Comparator.comparing(Product::getStock))
                .map(p -> new LowStockResponse(p.getId(), p.getName(), p.getImageUrl(), p.getStock()))
                .toList();

        return new DashboardResponse(
                revenue, totalOrders,
                productRepository.count(), userRepository.count(),
                averageOrderValue, byStatus, topSellers, lowStock);
    }

    private static BigDecimal toMoney(Object value) {
        if (value == null) return BigDecimal.ZERO;
        return (value instanceof BigDecimal bd ? bd : BigDecimal.valueOf(((Number) value).doubleValue()))
                .setScale(2, RoundingMode.HALF_UP);
    }
}
