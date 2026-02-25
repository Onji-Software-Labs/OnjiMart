package com.sattva.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RetailerBusinessRequestDTO {
    private String retailerId;

    private String name;
    private String address;
    private String city;
    private String pincode;
    private String contactNumber;

    private List<String> categoryIds;

}
