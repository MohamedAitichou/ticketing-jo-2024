package com.example.ticketing;

import com.example.ticketing.offer.Offer;
import com.example.ticketing.offer.OfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;


@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final OfferRepository repo;

    @Value("${app.seed:false}")
    private boolean seed;

    @Override
    public void run(String... args) {
        if (!seed) return;
        if (repo.count() > 0) return;

        repo.save(Offer.builder()
                .code("SOLO")
                .name("Billet Solo")
                .description("Accès standard pour 1 personne.")
                .seats(1)
                .priceCents(2500)
                .active(true)
                .build());

        repo.save(Offer.builder()
                .code("DUO")
                .name("Billet Duo")
                .description("Accès pour 2 personnes à tarif avantageux.")
                .seats(2)
                .priceCents(4500)
                .active(true)
                .build());

        repo.save(Offer.builder()
                .code("FAMILY")
                .name("Pack Familial")
                .description("Formule 4 personnes.")
                .seats(4)
                .priceCents(8000)
                .active(true)
                .build());
    }
}
