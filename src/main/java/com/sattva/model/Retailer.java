package com.sattva.model;


import jakarta.persistence.CascadeType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.util.List;

@Entity
@DiscriminatorValue("RETAILER")
@Table(name = "retailers")
public class Retailer extends User {

    private static final long serialVersionUID = 1L;

    @OneToMany(mappedBy = "retailer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Shop> shops; // Retailer may own multiple shops

}