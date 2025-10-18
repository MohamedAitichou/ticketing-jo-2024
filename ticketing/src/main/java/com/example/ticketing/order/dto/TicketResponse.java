package com.example.ticketing.order.dto;

public record TicketResponse(Long ticketId, Long offerId, String qrcodeBase64) {}
