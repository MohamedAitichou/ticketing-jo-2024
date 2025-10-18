package com.example.ticketing.order.dto;

import java.util.List;

public record CheckoutResponse(Long orderId, List<TicketResponse> tickets) {}
