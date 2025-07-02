package com.sattva.model;

import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
@Entity
@Table(name = "cart_items")
@Getter
@Setter
public class CartItem {
	@Id
    @UuidGenerator
    private String id;
	@ManyToOne
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart; // Link to the cart that contains this item

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product; // Link to the product in the cart

    private int quantity; // Quantity of the product in the cart
}
