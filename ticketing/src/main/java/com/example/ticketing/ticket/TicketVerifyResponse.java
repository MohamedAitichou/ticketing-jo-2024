package com.example.ticketing.ticket;

import java.time.Instant;

public record TicketVerifyResponse(boolean valid, Long ticketId, Long offerId, Instant consumedAt) {}
