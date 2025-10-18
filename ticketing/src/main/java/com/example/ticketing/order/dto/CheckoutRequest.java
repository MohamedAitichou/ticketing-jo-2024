package com.example.ticketing.order.dto;

import java.util.List;

public record CheckoutRequest(List<CheckoutItem> items) {}
