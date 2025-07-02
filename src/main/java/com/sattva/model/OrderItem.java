package com.sattva.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.UuidGenerator;

import com.sattva.enums.OrderItemStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "order_items")
@Getter
@Setter
public class OrderItem {

    @Id
    @UuidGenerator
    private String id;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    private int requestedQuantity; // Original quantity requested by the retailer
    private int fulfilledQuantity; // Quantity actually fulfilled by the supplier
    private double unitPrice; // Price per unit of the product
    private double totalPrice; // Total price for this item (fulfilledQuantity * unitPrice)

    @Enumerated(EnumType.STRING)
    private OrderItemStatus status = OrderItemStatus.PENDING; // Default status is PENDING

    private boolean isEditable = true; // Indicates whether this item can be edited
    private boolean isFulfilled = false; // Indicates whether this item has been fulfilled
    private boolean isBackordered = false; // Indicates whether the item is backordered
}
