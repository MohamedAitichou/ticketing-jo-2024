package com.example.ticketing.auth;

import com.example.ticketing.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "otp_codes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OtpCode {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false) @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String code; // 6 chiffres

    private Instant expiresAt;
    private Instant consumedAt;

    public boolean isValidNow() {
        return consumedAt == null && expiresAt != null && expiresAt.isAfter(Instant.now());
    }
}
