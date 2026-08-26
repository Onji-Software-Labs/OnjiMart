package com.sattva.dto;

import lombok.*;

import java.time.LocalDateTime;

@NoArgsConstructor
@Getter
@Setter
@AllArgsConstructor
@Builder
public class RetailerSearchHistoryDTO {
    private String id;
    private String searchText;
    private String searchedId; //ProductId or SupplierBusinessId
    private String type; // "PRODUCT" or "SUPPLIER"
    private LocalDateTime searchedAt;
    private String retailerId;

}
