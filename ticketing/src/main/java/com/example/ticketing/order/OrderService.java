package com.example.ticketing.order;

import com.example.ticketing.offer.Offer;
import com.example.ticketing.offer.OfferRepository;
import com.example.ticketing.order.dto.CheckoutItem;
import com.example.ticketing.order.dto.CheckoutRequest;
import com.example.ticketing.order.dto.CheckoutResponse;
import com.example.ticketing.order.dto.OrdersListResponse;
import com.example.ticketing.order.dto.TicketResponse;
import com.example.ticketing.ticket.Ticket;
import com.example.ticketing.ticket.TicketRepository;
import com.example.ticketing.user.User;
import com.example.ticketing.util.QrService;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.security.MessageDigest;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orders;
    private final OfferRepository offers;
    private final TicketRepository ticketRepo;
    private final QrService qrService;

    public OrderService(OrderRepository orders,
                        OfferRepository offers,
                        TicketRepository ticketRepo,
                        QrService qrService) {
        this.orders = orders;
        this.offers = offers;
        this.ticketRepo = ticketRepo;
        this.qrService = qrService;
    }

    /* ------------------ CHECKOUT ------------------ */

    @Transactional
    public CheckoutResponse checkout(User user, CheckoutRequest req) {
        if (req == null || req.items() == null || req.items().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Panier vide");
        }

        Order order = new Order();
        order.setUser(user);
        order.setPurchaseKey(UUID.randomUUID().toString());
        orders.save(order);

        long idx = 0;
        for (CheckoutItem it : req.items()) {
            int qty = Math.max(0, it.quantity());
            if (qty <= 0) continue;

            Offer offer = offers.findById(it.offerId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Offre inconnue"));

            for (int i = 0; i < qty; i++) {
                String fk = generateFinalKey(
                        user.getKUser(),
                        order.getPurchaseKey(),
                        offer.getId(),
                        idx++
                );
                Ticket t = Ticket.builder()
                        .order(order)
                        .offer(offer)
                        .finalKey(fk)
                        .build();
                ticketRepo.save(t);
            }
        }

        var tickets = ticketRepo.findByOrderOrderByIdAsc(order);

        return new CheckoutResponse(
                order.getId(),
                tickets.stream()
                        .map(t -> {
                            byte[] png = qrService.generatePng(t.getFinalKey(), 256);
                            String base64 = Base64.getEncoder().encodeToString(png);
                            return new TicketResponse(
                                    t.getId(),
                                    t.getOffer().getId(),
                                    base64
                            );
                        })
                        .toList()
        );
    }

    private String generateFinalKey(String kUser, String purchaseKey, Long offerId, long index) {
        String ku = (kUser == null || kUser.isBlank()) ? "nouser" : kUser;
        String src = ku + ":" + purchaseKey + ":" + offerId + ":" + index;
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(src.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (Exception e) {
            return UUID.randomUUID().toString().replace("-", "");
        }
    }

    /* ------------------ LISTE DES TICKETS D'UNE COMMANDE ------------------ */

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<Ticket> listTicketsForOrder(Long orderId, Long expectedUserId) {
        Order order = orders.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Commande inconnue"));

        if (!Objects.equals(order.getUser().getId(), expectedUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès interdit");
        }

        return ticketRepo.findByOrderOrderByIdAsc(order);
    }

    /* ------------------ LISTE DES COMMANDES D’UN UTILISATEUR ------------------ */

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<OrdersListResponse> listOrdersForUser(Long userId) {
        var list = orders.findByUserIdOrderByIdDesc(userId);
        return list.stream()
                .map(o -> new OrdersListResponse(o.getId(), o.getCreatedAt()))
                .toList();
    }
}
