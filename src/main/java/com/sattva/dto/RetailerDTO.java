package com.sattva.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RetailerDTO {

    private String id;
    private String fullName;
    private String email;
    private String pincode;
    private List<String> categoryIds;
    private List<String> subCategoryIds;
}
