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
                        // Preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Auth publique
                        .requestMatchers("/auth/**").permitAll()

                        // H2 console (dev)
                        .requestMatchers("/h2-console/**").permitAll()

                        // Offres publiques (si souhaité)
                        .requestMatchers(HttpMethod.GET, "/api/offers").permitAll()

                        // Image PNG du QR : publique (intégration <img src=...> côté front)
                        .requestMatchers(HttpMethod.GET, "/api/tickets/*/qr.png").permitAll()

                        // Vérification d'un ticket (scan) : publique
                        .requestMatchers(HttpMethod.GET, "/api/tickets/verify").permitAll()

                        // Consommation d'un ticket : RÉSERVÉ au staff/admin (durcissement)
                        .requestMatchers(HttpMethod.POST, "/api/tickets/consume").hasAnyRole("STAFF","ADMIN")

                        // Espace admin : réservé ADMIN
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Tout le reste des APIs nécessite un JWT
                        .requestMatchers("/api/**").authenticated()

                        // Le reste (fichiers statiques, etc.)
                        .anyRequest().permitAll()
                )

                .headers(h -> h.frameOptions(f -> f.disable()))

                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        var cors = new CorsConfiguration();
        cors.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://127.0.0.1:5173"
        ));
        cors.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        cors.setAllowedHeaders(List.of("Content-Type", "Authorization"));
        cors.setAllowCredentials(true);

        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cors);
        return source;
    }
}
