package com.sattva.dto;

import java.time.LocalDate;
import java.util.List;

import com.sattva.enums.DeliveryTimeSlot;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartDTO {
	  private String id;           // Cart ID
	    private String shopId;       // Shop ID that the cart belongs to
        private String supplierId;      // ← add
        private String supplierName;    // ← add (optional but useful)
        private List<CartItemDTO> items;
        private LocalDate deliveryDate;
        private DeliveryTimeSlot deliveryTimeSlot;
}
