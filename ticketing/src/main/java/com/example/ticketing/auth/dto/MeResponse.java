package com.example.ticketing.auth.dto;

import java.util.List;

public record MeResponse(
        Long id,
        String email,
        String firstName,
        String lastName,
        List<String> roles
) {}
