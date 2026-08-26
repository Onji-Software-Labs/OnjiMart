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
public class DiscoverSupplierDTO {
    private String id;
    private String supplierCount;
    private List<SupplierListDTO> suppliers;
}
