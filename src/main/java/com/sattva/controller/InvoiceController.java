package com.sattva.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sattva.dto.InvoiceDTO;
import com.sattva.service.InvoiceService;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {
    @Autowired
    private InvoiceService invoiceService;

    // Endpoint to generate a new invoice for an order
    @PostMapping("/generate")
    public ResponseEntity<InvoiceDTO> generateInvoice(
            @RequestParam String supplierId,
            @RequestParam String orderId,
            @RequestParam(required = false) Double deliveryCharge) {

        InvoiceDTO invoice = invoiceService.generateInvoice(supplierId, orderId, deliveryCharge);
        return ResponseEntity.ok(invoice);
    }

    // Endpoint to get all invoices for a supplier
    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<InvoiceDTO>> getInvoicesForSupplier(@PathVariable String supplierId) {
        List<InvoiceDTO> invoices = invoiceService.getInvoicesForSupplier(supplierId);
        return ResponseEntity.ok(invoices);
    }

    // Endpoint to view a specific invoice
    @GetMapping("/{invoiceId}")
    public ResponseEntity<InvoiceDTO> viewInvoice(@PathVariable String invoiceId) {
        InvoiceDTO invoice = invoiceService.viewInvoice(invoiceId);
        return ResponseEntity.ok(invoice);
    }
}
