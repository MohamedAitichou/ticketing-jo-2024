package com.example.ticketing.admin.dto;

public record SalesStat(
        Long offerId,
        String offerName,
        long ticketsSold
) {}
