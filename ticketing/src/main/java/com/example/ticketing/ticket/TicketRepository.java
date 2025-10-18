package com.example.ticketing.ticket;

import com.example.ticketing.admin.dto.SalesStat;
import com.example.ticketing.order.Order;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    /* -------- Tickets d'une commande (entité Order) -------- */
    List<Ticket> findByOrderOrderByIdAsc(Order order);

    /* -------- Tickets d'une commande par id (projection légère) -------- */
    List<TicketRow> findAllByOrderIdOrderByIdAsc(Long orderId);

    /* -------- Recherche/contrôle par finalKey -------- */
    Optional<Ticket> findByFinalKey(String finalKey);
    Optional<Ticket> findByFinalKeyAndConsumedAtIsNull(String finalKey);
    boolean existsByFinalKey(String finalKey);

    /* -------- Consommation atomique -------- */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
        update Ticket t
           set t.consumedAt = :now
         where t.finalKey = :finalKey
           and t.consumedAt is null
        """)
    int consumeOnce(@Param("finalKey") String finalKey, @Param("now") Instant now);

    /* -------- Stats admin : ventes par offre -------- */
    @Query("""
        select new com.example.ticketing.admin.dto.SalesStat(
            t.offer.id, t.offer.name, count(t)
        )
          from Ticket t
      group by t.offer.id, t.offer.name
      order by t.offer.id asc
        """)
    List<SalesStat> findSalesByOffer();

    boolean existsByOfferId(Long offerId);

    /* ========= Projections ========= */
    interface TicketRow {
        Long getId();

        @Value("#{target.offer.id}")
        Long getOfferId();

        String getFinalKey();
        Instant getConsumedAt();
    }
}
