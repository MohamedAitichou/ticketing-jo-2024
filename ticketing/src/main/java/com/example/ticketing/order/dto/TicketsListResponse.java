package com.example.ticketing.order.dto;

import java.util.List;

public record TicketsListResponse(
        Long orderId,
        List<TicketResponse> tickets
) {}
