package com.sattva.dto;

import lombok.Data;

@Data
public class EditOrderItemRequestDTO {

    private String itemId;
    private Integer fulfilledQuantity;
    private Double unitPrice;
}