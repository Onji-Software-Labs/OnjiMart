package com.sattva.dto;

import com.sattva.enums.OrderItemStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDTO {

    private String id; // Unique identifier of the order item

    private String productId; // ID of the product

    private String productName; // Name of the product

    private int requestedQuantity; // Original quantity requested by the retailer

    private int fulfilledQuantity; // Quantity actually fulfilled by the supplier (can be modified during fulfillment)

    private Double unitPrice; // Price per unit of the product (from aggregate or provided by supplier)

    private Double totalPrice; // The total price for this order item (unitPrice * fulfilledQuantity)

    private boolean isFulfilled; // Whether the item is fulfilled by the supplier

    private boolean isBackordered; // Whether the item is backordered

    private OrderItemStatus status; // Status of the order item (e.g., NEW, FULFILLED, BACKORDERED, OUT_OF_STOCK)

    private boolean editable; // Indicates whether the item can still be edited by the supplier
}
