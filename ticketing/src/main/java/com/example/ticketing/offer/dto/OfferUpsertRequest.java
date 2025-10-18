package com.example.ticketing.offer.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record OfferUpsertRequest(
        @NotBlank @Size(max = 32) String code,
        @NotBlank @Size(max = 128) String name,
        @Size(max = 1024) String description,
        @Min(0) int priceCents,
        @Min(1) int seats,
        Boolean active
) {}
