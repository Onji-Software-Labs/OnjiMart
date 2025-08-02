package com.sattva.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "supplier_businesses")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SupplierBusiness {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    private String name;       
    private String street;
    private String city;
    private String address;
    private String pincode;

    private String contactNumber;

    private boolean isActive;
}
