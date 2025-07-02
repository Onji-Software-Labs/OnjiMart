package com.sattva.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartDTO {
	  private String id;           // Cart ID
	    private String shopId;       // Shop ID that the cart belongs to
	    private List<CartItemDTO> items;
}
