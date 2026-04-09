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

    // NEW FIELDS FOR CART SCREEN
    private double price;  //Price of single unit of the product
    private double totalPrice; //Total price for this cart item price* quantity

}