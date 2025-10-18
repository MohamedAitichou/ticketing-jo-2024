package com.example.ticketing.offer;

import org.springframework.data.jpa.repository.JpaRepository;

public interface OfferRepository extends JpaRepository<Offer, Long> {
    boolean existsByCodeIgnoreCase(String code);
}
