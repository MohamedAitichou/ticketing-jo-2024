package com.example.ticketing.ticket;

import com.example.ticketing.offer.Offer;
import com.example.ticketing.order.Order;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(
        name = "ticket",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_ticket_final_key", columnNames = {"final_key"})
        }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Ticket {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false) @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne(optional = false) @JoinColumn(name = "offer_id")
    private Offer offer;

    @Column(name = "final_key", length = 64, nullable = false, unique = true)
    private String finalKey;

    private Instant consumedAt;
}
