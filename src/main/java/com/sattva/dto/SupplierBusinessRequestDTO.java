package com.sattva.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SupplierBusinessRequestDTO {
    private String supplierId;

    private String name;
    private String address;
    private String city;
    private String pincode;
    private String contactNumber;

    private List<String> categoryIds;
    private List<String> subCategoryIds;
}
