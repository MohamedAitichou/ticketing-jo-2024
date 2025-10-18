package com.example.ticketing.offer;

import com.example.ticketing.offer.dto.OfferUpsertRequest;
import com.example.ticketing.ticket.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/offers")
@RequiredArgsConstructor
public class AdminOfferController {

    private final OfferRepository offers;
    private final TicketRepository tickets;

    /* =============== LIST =============== */
    @GetMapping
    public List<Offer> list() {
        return offers.findAll();
    }

    /* =============== CREATE =============== */
    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody OfferUpsertRequest req) {
        if (offers.existsByCodeIgnoreCase(req.code())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Ce code d’offre existe déjà."));
        }
        Offer o = new Offer();
        apply(o, req);
        offers.save(o);
        return ResponseEntity.created(URI.create("/api/admin/offers/" + o.getId()))
                .body(o);
    }

    /* =============== UPDATE =============== */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody OfferUpsertRequest req) {
        Offer o = offers.findById(id).orElseThrow();
        // si le code change, vérifier l’unicité
        if (!o.getCode().equalsIgnoreCase(req.code()) && offers.existsByCodeIgnoreCase(req.code())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Ce code d’offre existe déjà."));
        }
        apply(o, req);
        offers.save(o);
        return ResponseEntity.ok(o);
    }

    /* =============== DELETE =============== */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        // garde-FK: refuser la suppression si des tickets existent
        if (tickets.existsByOfferId(id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error",
                            "Suppression impossible : des billets existent pour cette offre. " +
                                    "Désactivez l’offre plutôt que de la supprimer."));
        }
        offers.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /* =============== ACTIVER / DESACTIVER =============== */
    @PatchMapping("/{id}/active")
    public ResponseEntity<?> setActive(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        Offer o = offers.findById(id).orElseThrow();
        o.setActive(Boolean.TRUE.equals(body.get("active")));
        offers.save(o);
        return ResponseEntity.ok(o);
    }

    /* =============== MAPPING REQUEST -> ENTITY =============== */
    private void apply(Offer o, OfferUpsertRequest r) {
        o.setCode(r.code().trim());
        o.setName(r.name().trim());
        o.setDescription(r.description() == null ? "" : r.description().trim());
        o.setSeats(r.seats());
        o.setPriceCents(r.priceCents());
        o.setActive(Boolean.TRUE.equals(r.active()));
    }
}
