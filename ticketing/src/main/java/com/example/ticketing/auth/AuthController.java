package com.example.ticketing.auth;

import com.example.ticketing.user.User;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(value = {"/auth"}, produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService auth;

    /* ===================== DTO internes ===================== */

    public record RegisterRequest(
            @Email @NotBlank String email,
            @NotBlank String password,
            String firstName,
            String lastName
    ) {}

    public record LoginRequest(
            @Email @NotBlank String email,
            @NotBlank String password
    ) {}

    public record OtpVerifyRequest(
            @Email @NotBlank String email,
            @NotBlank String code
    ) {}

    public record MeResponse(
            Long id,
            String email,
            String firstName,
            String lastName,
            List<String> roles
    ) {}

    /* ===================== AUTH ===================== */

    @PostMapping(value = "/register", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        final String email = req.email().trim().toLowerCase();
        final String password = req.password().trim();
        final String firstName = req.firstName() != null ? req.firstName().trim() : null;
        final String lastName  = req.lastName()  != null ? req.lastName().trim()  : null;

        auth.register(email, password, firstName, lastName);
        return ResponseEntity.ok(Map.of("message", "ok"));
    }

    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        final String email = req.email().trim().toLowerCase();
        final String password = req.password().trim();

        auth.login(email, password);
        return ResponseEntity.ok(Map.of("otpRequired", true));
    }

    @PostMapping(value = "/otp/verify", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> verify(@Valid @RequestBody OtpVerifyRequest req) {
        final String email = req.email().trim().toLowerCase();
        final String code  = req.code().trim();

        String token = auth.verifyOtp(email, code);
        return ResponseEntity.ok(Map.of("token", token));
    }

    /* ===================== ME (pour le front) ===================== */

    @GetMapping("/api/me")
    public ResponseEntity<MeResponse> me(
            @AuthenticationPrincipal(expression = "user") User user
    ) {
        List<String> roles = user.getRoles()
                .stream()
                .map(String::valueOf)
                .toList();

        return ResponseEntity.ok(new MeResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                roles
        ));
    }
}
