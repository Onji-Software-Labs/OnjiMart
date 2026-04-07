package com.sattva.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierBusinessResponseDTO {
    // Business fields
    private String BusinessName;
    private String address;
    private String city;
    private String pincode;
    private String contactNumber;
    private boolean isActive;

    // Supplier fields
    private String supplierId;

    // Category & Subcategory IDs
    private Set<String> categoryIds;
    private Set<String> subCategoryIds;
}