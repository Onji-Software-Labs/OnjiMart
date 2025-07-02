package com.sattva.model;

import java.util.List;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "shops")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shop {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID) // Auto-generate a UUID for each shop
    private String id;

    @ManyToOne
    @JoinColumn(name = "retailer_id", nullable = false)
    private Retailer retailer;

    private String name;

    // Detailed address fields
    private String street; // Street name and number (e.g., "123 Main St")
    private String city;   // City (e.g., "Bangalore")
    private String state;  // State (e.g., "Karnataka")
    private String pincode; // Postal code (e.g., "560001")
    private String Country;
    private double latitude;  // Optional, for map integration
    private double longitude; // Optional, for map integration
    // Contact details
    private String contactNumber;

    // Operational details
    @ElementCollection
    private List<String> openingHours; // e.g., ["Mon-Fri: 9 AM - 6 PM", "Sat: 10 AM - 4 PM"]

    private boolean isActive; // Operational status of the shop
}
