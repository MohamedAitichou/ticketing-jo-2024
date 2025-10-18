package com.example.ticketing.security;

import com.example.ticketing.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Objects;


@Service
public class JwtService {

    private static final String ISSUER = "ticketing-app";
    private static final long ALLOWED_CLOCK_SKEW_SECONDS = 30;

    private final String secret;
    private final long expiresMillis;
    private SecretKey key;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expires-min:60}") long expiresMin
    ) {
        this.secret = Objects.requireNonNull(secret, "app.jwt.secret manquant");
        this.expiresMillis = expiresMin * 60_000L;
    }

    @PostConstruct
    void init() {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /* ---------- ÉMISSION ---------- */

    public String generate(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .setIssuer(ISSUER)
                .setSubject(user.getEmail())
                .claim("uid", user.getId())
                .claim("roles", user.getRoles())
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusMillis(expiresMillis)))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /* ---------- LECTURE / VALIDATION ---------- */

    public String getSubject(String token) {
        return parseClaims(sanitize(token)).getSubject();
    }

    public Date getExpiration(String token) {
        return parseClaims(sanitize(token)).getExpiration();
    }

    public boolean isTokenValid(String token, org.springframework.security.core.userdetails.UserDetails userDetails) {
        try {
            Claims claims = parseClaims(sanitize(token));
            String subject = claims.getSubject();
            Date exp = claims.getExpiration();
            return subject != null
                    && subject.equals(userDetails.getUsername())
                    && exp != null
                    && exp.after(new Date()); // non expiré
        } catch (Exception e) {
            return false;
        }
    }

    /* ---------- Internes ---------- */

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .setAllowedClockSkewSeconds(ALLOWED_CLOCK_SKEW_SECONDS)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private static String sanitize(String token) {
        if (token == null) return null;
        String t = token.trim();
        if (t.regionMatches(true, 0, "Bearer ", 0, 7)) {
            return t.substring(7).trim();
        }
        return t;
    }
}
