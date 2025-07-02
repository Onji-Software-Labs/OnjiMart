package com.sattva.service;

import java.util.List;

import com.sattva.dto.OrderDTO;
import com.sattva.dto.OrderItemDTO;
import com.sattva.enums.OrderItemStatus;

public interface OrderService {
    OrderDTO createOrderFromCart(String cartId);
    List<OrderDTO> getOrdersBySupplierId(String supplierId);
    OrderItemDTO updateOrderItemStatus(String orderId, String itemId, OrderItemStatus status);
    public OrderItemDTO fulfillOrderItem(String orderId, String itemId, Double unitPrice, Integer fulfilledQuantity);
}
