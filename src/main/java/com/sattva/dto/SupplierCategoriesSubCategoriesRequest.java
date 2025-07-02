package com.sattva.dto;

import java.util.List;

import lombok.Data;
@Data
public class SupplierCategoriesSubCategoriesRequest {

    private List<String> categoryIds;    // List of category IDs to be associated with the supplier
    private List<String> subCategoryIds;
}