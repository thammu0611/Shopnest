package com.shopnest.ecommerce.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class DashboardDtos {

    public record TopSellerResponse(
            Long productId,
            String name,
            String imageUrl,
            long unitsSold,
            BigDecimal revenue
    ) {}

    public record LowStockResponse(
            Long productId,
            String name,
            String imageUrl,
            Integer stock
    ) {}

    public record DashboardResponse(
            BigDecimal totalRevenue,
            long totalOrders,
            long totalProducts,
            long totalCustomers,
            BigDecimal averageOrderValue,
            /** order status name -> how many orders currently sit in it */
            Map<String, Long> ordersByStatus,
            List<TopSellerResponse> topSellers,
            List<LowStockResponse> lowStock,
            long openMessages,
            long subscribers,
            long activeCoupons
    ) {}
}
