package com.sattva.dto;

import lombok.*;

@NoArgsConstructor
@Getter
@Setter
@AllArgsConstructor
@Builder
public class RetailerSearchSuggestionDTO {
    private String id;
    private String name;
    private String type; // "PRODUCT" or "SUPPLIER"
}
