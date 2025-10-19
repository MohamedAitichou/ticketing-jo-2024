package com.example.ticketing;

import com.example.ticketing.user.User;
import com.example.ticketing.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail("admin@jo.fr").isPresent()) return;

        // Création de l'admin
        User admin = User.builder()
                .email("admin@jo.fr")
                .passwordHash(passwordEncoder.encode("Azerty!123"))
                .firstName("Admin")
                .lastName("JO")
                .roles(Arrays.asList("ROLE_ADMIN", "ROLE_USER"))
                .build();

        userRepository.save(admin);

        System.out.println("✅ Admin créé : admin@jo.fr / Azerty!123");
    }
}
