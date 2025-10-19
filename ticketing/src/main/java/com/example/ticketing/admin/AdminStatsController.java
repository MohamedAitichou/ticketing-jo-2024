package com.example.ticketing.admin;

import com.example.ticketing.admin.dto.AdminSalesResponse;
import com.example.ticketing.admin.dto.SalesStat;
import com.example.ticketing.ticket.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminStatsController {

    private final TicketRepository tickets;

    @GetMapping("/sales")
    @PreAuthorize("hasRole('ADMIN')") //
    public AdminSalesResponse sales() {
        List<SalesStat> list = tickets.findSalesByOffer();
        long total = list.stream().mapToLong(SalesStat::ticketsSold).sum();
        return new AdminSalesResponse(total, list);
    }
}
