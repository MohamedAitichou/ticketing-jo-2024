package com.example.ticketing.ticket;

import java.time.Instant;

public record TicketResponse(
        Long ticketId,
        Long offerId,
        String finalKey,
        Instant consumedAt
) {}
