package com.sattva.model;

import org.hibernate.annotations.UuidGenerator;

import com.sattva.enums.QuantityType;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @UuidGenerator
    private String productId;

    private String name;

    private String description;

    private double price;

    private int stockQuantity;

    @Enumerated(EnumType.STRING)
    private QuantityType quantityType; // COUNT, WEIGHT (Unit of measurement)

    private String unitValue; // e.g., kg, grams, units

    private double minOrderQuantity; // Minimum order quantity (e.g., 0.5 kg for loose items)

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne
    @JoinColumn(name = "subcategory_id", nullable = true)
    private SubCategory subCategory;
}
