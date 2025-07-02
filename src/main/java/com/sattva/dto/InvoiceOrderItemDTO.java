package com.sattva.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class InvoiceOrderItemDTO {

    private String id; // Unique identifier for the invoice order item

    private String productId; // ID of the product

    private String productName; // Name of the product

    private int quantity; // Quantity of the product

    private double unitPrice; // Unit price for the product

    private double totalPrice; // Total price for this item (unit price * quantity)

    private String orderItemId; // ID of the original order item that was fulfilled
}
