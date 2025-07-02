package com.sattva.dto;

import com.sattva.enums.InvoiceStatus;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
public class InvoiceDTO {

    private String id; // Unique identifier of the invoice

    private String shopId; // ID of the shop

    private String retailerId; // ID of the retailer

    private String supplierId; // ID of the supplier

    private LocalDateTime invoiceDate; // Date when the invoice was generated

    private List<InvoiceOrderItemDTO> invoiceOrderItems; // List of invoice items

    private double totalPrice; // Grand total price for the invoice

    private Double deliveryCharge; // Optional delivery charge for the invoice

    private InvoiceStatus status; // Status of the invoice (e.g., PENDING, GENERATED, PAID)

    private LocalDateTime dateEntered; // Date when the invoice was created

    private LocalDateTime dateModified; // Date when the invoice was last modified

    private String modifiedUserId; // ID of the user who last modified the invoice
}
