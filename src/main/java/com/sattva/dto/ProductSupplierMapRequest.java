package com.sattva.dto;

import lombok.Data;

@Data
public class ProductSupplierMapRequest {

    private String productId;
    private String supplierId;
}