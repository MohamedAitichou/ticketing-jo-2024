package com.example.ticketing.security;

import org.springframework.stereotype.Component;

@Component
public class PasswordValidator {

    // Min 8, au moins 1 maj, 1 min, 1 chiffre, 1 spécial
    private static final String REGEX =
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_]).{8,}$";

    public boolean isValid(String raw) {
        return raw != null && raw.matches(REGEX);
    }

    public String rules() {
        return "8+ caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 spécial";
    }
}
