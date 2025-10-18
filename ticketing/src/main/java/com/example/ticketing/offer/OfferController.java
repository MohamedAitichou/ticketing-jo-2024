package com.example.ticketing.offer;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/offers")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class OfferController {

    private final OfferRepository repo;

    @GetMapping
    public List<Offer> list() {
        return repo.findAll().stream()
                .filter(o -> Boolean.TRUE.equals(o.getActive()))
                .toList();
    }
}
