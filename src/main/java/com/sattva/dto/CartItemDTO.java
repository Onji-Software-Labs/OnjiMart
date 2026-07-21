package com.sattva.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class CartItemDTO {

    private String id;           // Cart Item ID
    private String productId;    // Product ID
    private String productName; // Product Name
    private int quantity;  

    // NEW FIELDS FOR CART SCREEN
    private double price;  //Price of single unit of the product
    private double totalPrice; //Total price for this cart item price* quantity
    private String cartId; // ← nouveau champ

}