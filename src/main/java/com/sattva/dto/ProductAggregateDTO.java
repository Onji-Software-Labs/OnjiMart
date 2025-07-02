package com.sattva.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductAggregateDTO {
    private String id; // Unique identifier for the product aggregate
    private String productId; // Product ID
    private String productName; // Product Name (Optional, for reference)
    private double unitPrice; // Price per unit of the product
    private int totalQuantity; // Total quantity aggregated for this product
}