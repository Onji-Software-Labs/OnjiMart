package com.sattva.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SupplierListDTO {
    private String userId;
    private String businessName;
    private String address;
    private String city;
    private String pincode;
    private String contactNumber;
    private String profilePicture;
    private Double rating;
}