package com.example.ticketing.auth;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @Email @NotBlank @JsonAlias({"email","username"}) String email,
        @NotBlank String password
) {}
