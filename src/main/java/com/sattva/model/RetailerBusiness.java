package com.sattva.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "retailer_businesses")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RetailerBusiness {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "retailer_id", nullable = false)
    private Retailer retailer;

    private String name;
    private String street;
    private String city;
    private String address;
    private String pincode;
    private String contactNumber;
    private boolean isActive;

}
