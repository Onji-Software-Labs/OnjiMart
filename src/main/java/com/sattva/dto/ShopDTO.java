package com.sattva.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopDTO {
    private String id;
    private String retailerId;
    private String name;
    private String location;
    private String street;
    private String city;
    private String state;
    private String pincode;
    private String country;
    private double latitude;
    private double longitude;
    private String contactNumber;
    private List<String> openingHours;
    private boolean isActive;
}
