package com.example.ticketing.ticket;

import com.example.ticketing.util.QrService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final TicketRepository ticketRepository;
    private final QrService qrService;

    @GetMapping("/verify")
    public ResponseEntity<TicketVerifyResponse> verify(@RequestParam("key") String key) {
        var res = ticketService.verifyByKey(key);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/consume")
    public ResponseEntity<TicketConsumeResponse> consume(@RequestBody ConsumeRequest req) {
        var res = ticketService.consumeByKey(req.key());
        return ResponseEntity.ok(res);
    }

    @GetMapping(value = "/{ticketId}/qr.png", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> qrPng(@PathVariable Long ticketId) {
        var t = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket introuvable"));
        byte[] png = qrService.generatePng(t.getFinalKey(), 256);
        return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG).body(png);
    }

    public record ConsumeRequest(String key) {}
}
