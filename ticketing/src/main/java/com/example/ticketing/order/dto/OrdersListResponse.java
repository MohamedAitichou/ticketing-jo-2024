package com.example.ticketing.order.dto;

import java.time.Instant;

public record OrdersListResponse(
        Long id,
        Instant createdAt
) {}
