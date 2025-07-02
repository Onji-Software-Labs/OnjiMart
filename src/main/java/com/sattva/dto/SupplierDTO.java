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
public class SupplierDTO {
    private String id;
    private String fullName; // From User class (as Supplier extends User)
    private String email;    // From User class
    private List<String> categoryIds;
    private List<String> subCategoryIds;
}