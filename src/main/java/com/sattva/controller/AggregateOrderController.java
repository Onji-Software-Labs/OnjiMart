package com.sattva.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sattva.dto.AggregateOrderDTO;
import com.sattva.dto.ProductAggregateDTO;
import com.sattva.service.AggregateOrderService;

@RestController
@RequestMapping("/api/aggregates")
@CrossOrigin
public class AggregateOrderController {

    @Autowired
    private AggregateOrderService aggregateOrderService;

//    // Clear aggregates manually by the supplier
//    @PreAuthorize("hasRole('ROLE_SUPPLIER')")
    @PutMapping("/{supplierId}/clear")
    public ResponseEntity<String> clearAggregateForSupplier(@PathVariable String supplierId) {
        try {
            aggregateOrderService.clearAggregates(supplierId);
            return ResponseEntity.ok("Aggregate cleared successfully for supplier with ID: " + supplierId);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Failed to clear aggregate: " + e.getMessage());
        }
    }
    @GetMapping("/{supplierId}")
    public ResponseEntity<List<AggregateOrderDTO>> getAggregateOrdersForSupplierAndDate(
            @PathVariable String supplierId,
            @RequestParam("date") String date) {

        LocalDate aggregateDate = LocalDate.parse(date);
        List<AggregateOrderDTO> aggregateOrders = aggregateOrderService.getAggregateOrdersForSupplierAndDate(supplierId, aggregateDate);
        return ResponseEntity.ok(aggregateOrders);
    }

    @PutMapping("/{aggregateOrderId}/products/{productId}/update-price")
    public ResponseEntity<ProductAggregateDTO> updateProductUnitPrice(
            @PathVariable String aggregateOrderId,
            @PathVariable String productId,
            @RequestParam double unitPrice) {

        ProductAggregateDTO updatedProductAggregate = aggregateOrderService.updateProductUnitPrice(aggregateOrderId, productId, unitPrice);
        return ResponseEntity.ok(updatedProductAggregate);
    }
 
}