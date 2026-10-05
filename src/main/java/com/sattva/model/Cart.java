package com.sattva.model;

import java.time.LocalDate;
import java.util.Set;

import com.sattva.enums.DeliveryTimeSlot;
import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "carts")
@Getter
@Setter

public class Cart {

	@Id
    @UuidGenerator
    private String id;

	@ManyToOne
    @JoinColumn(name = "shop_id", nullable = false)
    private Shop shop; // Each cart is linked to a shop
	@ManyToOne
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<CartItem> items; // Cart items

    // Delivery date selected by retailer during checkout
    @Column(name = "delivery_date")
    private LocalDate deliveryDate;

    // Delivery time slot selected by retailer (Morning / Afternoon / Evening)
    @Enumerated(EnumType.STRING)
    private DeliveryTimeSlot deliveryTimeSlot;
}