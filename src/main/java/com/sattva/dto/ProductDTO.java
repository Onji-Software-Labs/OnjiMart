package com.sattva.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.sattva.enums.QuantityType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductDTO {
    private String productId;
    private String name;
    private String description;
    private double price;
    private int stockQuantity;
    private QuantityType quantityType; // COUNT or WEIGHT
    private String unitValue; // e.g., kg, grams, units
    private double minOrderQuantity; // Minimum order quantity for the product
    private String categoryId;
    private String subCategoryId;
}
