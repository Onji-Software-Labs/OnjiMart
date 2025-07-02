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
public class SubCategoryDTO {
    private String id;
    private String name;
    private String description;
    private String categoryId; 
    private List<ProductDTO> products;
}