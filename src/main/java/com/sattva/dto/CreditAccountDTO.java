package com.sattva.dto;

import lombok.*;

import java.time.LocalDateTime;

@NoArgsConstructor
@Getter
@Setter
@AllArgsConstructor
@Builder
public class CreditAccountDTO {
    private String id;
    private String supplierId;
    private String retailerId;
    private String retailerName;
    private String retailerAddress;
    private String  status; // NEW or ONGOING or DECLINED
    private String reliability;
    private Double totalOwed;
    private String repaymentScore;
    private Integer durationOfMonths;
    private Integer totalInstallments;
    private Double totalPaid;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
