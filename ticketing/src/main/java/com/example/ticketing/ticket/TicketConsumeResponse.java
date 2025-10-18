package com.example.ticketing.ticket;

import java.time.Instant;

public record TicketConsumeResponse(Long ticketId, Long offerId, Instant consumedAt) {}
