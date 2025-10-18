package com.example.ticketing.auth;

import com.example.ticketing.security.JwtService;
import com.example.ticketing.user.User;
import com.example.ticketing.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository users;
    private final OtpCodeRepository otps;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public void register(String email, String rawPwd, String first, String last) {
        String normEmail = email == null ? null : email.trim().toLowerCase();

        users.findByEmail(normEmail).ifPresent(u -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email déjà utilisé");
        });

        User u = User.builder()
                .email(normEmail)
                .passwordHash(encoder.encode(rawPwd))
                .firstName(first != null ? first.trim() : null)
                .lastName(last != null ? last.trim() : null)
                .build();
        users.save(u);
    }

    public void login(String email, String rawPwd) {
        String normEmail = email == null ? null : email.trim().toLowerCase();

        User u = users.findByEmail(normEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur inconnu"));

        if (!encoder.matches(rawPwd, u.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Mot de passe invalide");
        }

        // Génère un OTP 6 chiffres (valide 2 min)
        String code = String.format("%06d", new SecureRandom().nextInt(1_000_000));
        OtpCode otp = OtpCode.builder()
                .user(u)
                .code(code)
                .expiresAt(Instant.now().plus(2, ChronoUnit.MINUTES))
                .build();
        otps.save(otp);

        System.out.println("OTP pour " + normEmail + " = " + code + " (valide 2 min)");
    }

    @Transactional
    public String verifyOtp(String email, String code) {
        String normEmail = email == null ? null : email.trim().toLowerCase();
        String normCode  = code  == null ? null : code.trim();

        User u = users.findByEmail(normEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur inconnu"));

        OtpCode last = otps.findTopByUserOrderByIdDesc(u)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "OTP introuvable"));


        if (!last.isValidNow()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "OTP expiré ou déjà utilisé");
        }
        if (!last.getCode().equals(normCode)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "OTP invalide");
        }

        last.setConsumedAt(Instant.now());
        otps.save(last);

        return jwt.generate(u);
    }
}
