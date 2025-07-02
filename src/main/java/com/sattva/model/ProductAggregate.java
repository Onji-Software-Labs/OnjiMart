package com.sattva.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "product_aggregates")
@Getter
@Setter
public class ProductAggregate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "aggregate_order_id", nullable = false)
    private AggregateOrder aggregateOrder; // Link to the aggregate order this product aggregate belongs to

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    private int totalQuantity;

    // Change the unitPrice from double to Double to allow null values
    private Double unitPrice; // Unit price of this product in the aggregate
}
