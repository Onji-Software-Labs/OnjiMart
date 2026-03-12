package com.sattva.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteSupplierDTO {

    private String supplierId;

    private String supplierName;

    private Double rating;

}