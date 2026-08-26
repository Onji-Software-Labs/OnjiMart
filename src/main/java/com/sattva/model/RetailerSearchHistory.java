package com.sattva.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "retailer_search_history")
@Getter
@Setter
public class RetailerSearchHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String searchText;
    private String searchedId; //ProductId or SupplierBusinessId
    private String type;        // "PRODUCT" or "SUPPLIER"
    private LocalDateTime searchedAt;

    @ManyToOne
    @JoinColumn(name = "retailer_id", nullable = false)
    private Retailer retailer;

}
