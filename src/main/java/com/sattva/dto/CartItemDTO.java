package com.sattva.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartItemDTO {

    private String id;           // Cart Item ID
    private String productId;    // Product ID
    private String productName; // Product Name
    private int quantity;   
}