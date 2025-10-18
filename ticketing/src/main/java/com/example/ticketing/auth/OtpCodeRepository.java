package com.example.ticketing.auth;

import com.example.ticketing.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OtpCodeRepository extends JpaRepository<OtpCode, Long> {
    Optional<OtpCode> findTopByUserOrderByIdDesc(User user);
}
