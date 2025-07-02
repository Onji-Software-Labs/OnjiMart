package com.sattva.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AggregateOrderDTO {
    private String id;
    private String supplierId;
    private LocalDate aggregateDate;
    private Set<ProductAggregateDTO> productAggregates;
}