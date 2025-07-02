package com.sattva.dto;

import java.time.LocalDateTime;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.sattva.enums.OrderStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {

    private String id; // UUID of the order

    private String supplierId; // UUID of the supplier

    private String supplierName; // Name of the supplier

    private String shopId; // UUID of the shop

    private String shopName; // Name of the shop

    private String retailerId; // UUID of the retailer

    private String retailerName; // Name of the retailer

    private LocalDateTime orderDate; // Date when the order was placed

    private OrderStatus status; // Order status (e.g., NEW, PROCESSING, COMPLETED)

    private boolean isCompleted; // Indicates if the order is completed

    private Set<OrderItemDTO> items; // List of items in the order
}

