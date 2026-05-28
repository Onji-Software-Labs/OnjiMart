package com.sattva.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class CreateOrderRequestDTO {

    // Cart ID used to create the order
    private String cartId;

    // Delivery date selected by retailer
    private LocalDate deliveryDate;

    // Delivery time slot selected by retailer
    private String deliveryTimeSlot;
}