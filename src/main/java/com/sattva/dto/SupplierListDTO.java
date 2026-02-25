package com.sattva.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SupplierListDTO {
    private String userId;
    private String fullName;
    private String businessName;
    private String city;
    private Double rating;
}
