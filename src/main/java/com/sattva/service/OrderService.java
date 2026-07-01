package com.sattva.service;

import java.util.List;

import com.sattva.dto.CreateOrderRequestDTO;
import com.sattva.dto.EditOrderRequestDTO;
import com.sattva.dto.OrderDTO;
import com.sattva.dto.OrderItemDTO;
import com.sattva.enums.OrderItemStatus;
import com.sattva.enums.OrderStatus;

public interface OrderService {
    OrderDTO createOrderFromCart(CreateOrderRequestDTO request);
    List<OrderDTO> getOrdersBySupplierId(String supplierId);
    OrderItemDTO updateOrderItemStatus(String orderId, String itemId, OrderItemStatus status);
    public OrderItemDTO fulfillOrderItem(String orderId, String itemId, Double unitPrice, Integer fulfilledQuantity);

    // Get all retailer orders
    List<OrderDTO> getOrdersByRetailerId(String retailerId);

    // Get retailer orders by status filter
    List<OrderDTO> getOrdersByRetailerIdAndStatus(String retailerId, List<OrderStatus> statuses);

    // Get retailer orders for specific supplier
    List<OrderDTO> getOrdersByRetailerAndSupplier(String retailerId,String supplierId);

    // Get supplier orders by status filter
    List<OrderDTO> getOrdersBySupplierIdAndStatus(String supplierId,List<OrderStatus> statuses);

    // Get supplier orders for specific retailer
    List<OrderDTO> getOrdersBySupplierAndRetailer(String supplierId,String retailerId);

    // Get retailer order details by order ID
    OrderDTO getOrderById(String orderId);

    // Edit all order items before supplier confirms the order.
    OrderDTO editOrder(String orderId,EditOrderRequestDTO request);
}
