package com.sattva.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;

@Entity
@Table(name = "credit_account")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class CreditAccount {
    @Id
    @UuidGenerator
    private String id;

    @ManyToOne
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @ManyToOne
    @JoinColumn(name = "retailer_id", nullable = false)
    private Retailer retailer;

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
