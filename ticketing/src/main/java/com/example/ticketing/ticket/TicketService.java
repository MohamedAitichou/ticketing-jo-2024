package com.example.ticketing.ticket;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepo;

    /* ----------- Vérifier un ticket par sa finalKey ----------- */
    @Transactional(readOnly = true)
    public TicketVerifyResponse verifyByKey(String finalKey) {
        if (finalKey == null || finalKey.isBlank()) {
            return new TicketVerifyResponse(false, null, null, null);
        }

        var ticketOpt = ticketRepo.findByFinalKey(finalKey.trim());
        var t = ticketOpt.orElse(null);

        boolean valid = t != null;
        Long ticketId = (t != null) ? t.getId() : null;
        Long offerId  = (t != null && t.getOffer() != null) ? t.getOffer().getId() : null;
        Instant consumedAt = (t != null) ? t.getConsumedAt() : null;

        return new TicketVerifyResponse(valid, ticketId, offerId, consumedAt);
    }

    /* ----------- Consommer un ticket par sa finalKey ----------- */
    @Transactional
    public TicketConsumeResponse consumeByKey(String finalKey) {
        if (finalKey == null || finalKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "clé manquante");
        }

        var t = ticketRepo.findByFinalKeyAndConsumedAtIsNull(finalKey.trim())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Ticket introuvable ou déjà consommé"));

        t.setConsumedAt(Instant.now());
        ticketRepo.save(t);

        return new TicketConsumeResponse(
                t.getId(),
                (t.getOffer() != null ? t.getOffer().getId() : null),
                t.getConsumedAt()
        );
    }
}
