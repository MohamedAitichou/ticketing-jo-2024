package com.example.ticketing.order;

import com.example.ticketing.order.dto.*;
import com.example.ticketing.ticket.Ticket;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<CheckoutResponse> checkout(
            @AuthenticationPrincipal(expression = "user") com.example.ticketing.user.User user,
            @RequestBody CheckoutRequest req
    ) {
        return ResponseEntity.ok(orderService.checkout(user, req));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<OrdersListResponse>> myOrders(
            @AuthenticationPrincipal(expression = "user") com.example.ticketing.user.User user
    ) {
        return ResponseEntity.ok(orderService.listOrdersForUser(user.getId()));
    }

    @GetMapping("/{orderId}/tickets")
    public ResponseEntity<List<TicketDto>> ticketsForOrder(
            @AuthenticationPrincipal(expression = "user") com.example.ticketing.user.User user,
            @PathVariable Long orderId
    ) {
        var tickets = orderService.listTicketsForOrder(orderId, user.getId());

        var dtoList = tickets.stream()
                .map(t -> new TicketDto(
                        t.getId(),
                        t.getOffer() != null ? t.getOffer().getId() : null,
                        t.getOffer() != null ? t.getOffer().getName() : null,
                        t.getFinalKey(),
                        t.getConsumedAt()
                ))
                .toList();

        return ResponseEntity.ok(dtoList);
    }
}
