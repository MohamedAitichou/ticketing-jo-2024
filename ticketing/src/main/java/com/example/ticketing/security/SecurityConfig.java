package com.example.ticketing.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.time.Duration;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                /* CORS + CSRF */
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())

                /* Sessions stateless (JWT) */
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                /* Règles d'accès */
                .authorizeHttpRequests(auth -> auth
                        // Preflight (navigateur)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Auth publique (login, otp…)
                        .requestMatchers("/auth/**").permitAll()

                        // H2 console (mode dev uniquement)
                        .requestMatchers("/h2-console/**").permitAll()

                        .requestMatchers("/actuator/**").permitAll()

                        // Offres publiques
                        .requestMatchers(HttpMethod.GET, "/api/offers").permitAll()

                        // Image PNG du QR
                        .requestMatchers(HttpMethod.GET, "/api/tickets/*/qr.png").permitAll()

                        // Vérification d’un ticket (scan)
                        .requestMatchers(HttpMethod.GET, "/api/tickets/verify").permitAll()

                        // Consommation d’un ticket : réservé AGENT ou ADMIN
                        .requestMatchers(HttpMethod.POST, "/api/tickets/consume").hasAnyRole("AGENT", "ADMIN")

                        // Espace admin : réservé ADMIN
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Toute autre API nécessite un JWT
                        .requestMatchers("/api/**").authenticated()

                        // Le reste
                        .anyRequest().permitAll()
                )

                .headers(h -> h.frameOptions(f -> f.disable()))

                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cors = new CorsConfiguration();

        cors.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://127.0.0.1:5173"
                // "https://ton-front.vercel.app"
        ));

        cors.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cors.setAllowedHeaders(List.of("Content-Type", "Authorization"));
        cors.setAllowCredentials(true);
        cors.setMaxAge(Duration.ofHours(1));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cors);
        return source;
    }
}
