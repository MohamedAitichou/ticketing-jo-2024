package com.example.ticketing.admin.dto;

import java.util.List;

public record AdminSalesResponse(
        long total,
        List<SalesStat> byoffer
) {}
