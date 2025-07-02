package com.sattva.enums;

public enum OrderItemStatus {
    PENDING,        // Order placed but not yet processed
    FULFILLED,      // Item fulfilled
    OUT_OF_STOCK,   // Item is out of stock
    BACKORDERED     // Item will be delivered later (backordered)
}