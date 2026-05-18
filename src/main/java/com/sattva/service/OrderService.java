package com.sattva.service;

import java.util.List;

import com.sattva.dto.OrderDTO;
import com.sattva.dto.OrderItemDTO;
import com.sattva.enums.OrderItemStatus;
import com.sattva.enums.OrderStatus;

public interface OrderService {
    OrderDTO createOrderFromCart(String cartId);
    List<OrderDTO> getOrdersBySupplierId(String supplierId);
    OrderItemDTO updateOrderItemStatus(String orderId, String itemId, OrderItemStatus status);
    public OrderItemDTO fulfillOrderItem(String orderId, String itemId, Double unitPrice, Integer fulfilledQuantity);

    // Get retailer orders by status filter
    List<OrderDTO> getOrdersByRetailerIdAndStatus(String retailerId, List<OrderStatus> statuses);

    // Get retailer orders for specific supplier by statuses
    List<OrderDTO> getOrdersByRetailerAndSupplierAndStatus(String retailerId,String supplierId,List<OrderStatus> statuses);

    // Get retailer order details by order ID
    OrderDTO getOrderById(String orderId);
}
