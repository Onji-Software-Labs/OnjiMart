package com.sattva.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RetailerListDTO {
    private String retailerId;
    private String businessId;
    private String name;
    private String address;
    private String city;
    private String contactNumber;
    private Double rating;
}
