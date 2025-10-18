package com.example.ticketing.order.dto;

import java.time.Instant;

public record TicketDto(
        Long id,
        Long offerId,
        String offerName,
        String finalKey,
        Instant consumedAt
) {}
