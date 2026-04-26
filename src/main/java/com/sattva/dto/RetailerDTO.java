package com.sattva.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RetailerDTO {

    private String id;
    private String fullName;
    private String businessName;
    private String email;
    private String pincode;
    private String address;
    private String city;
    private String contactNumber;
    private List<String> categoryIds;
}
