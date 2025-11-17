package com.sattva.controller;

import com.sattva.dto.OrderDTO;
import com.sattva.dto.OrderItemDTO;
import com.sattva.enums.OrderItemStatus;
import com.sattva.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin
public class OrderController {

    @Autowired
    private OrderService orderService;

    // Endpoint for retailer to create an order from a cart
//    @PreAuthorize("hasRole('ROLE_RETAILER')")
    @PostMapping("/submit/{cartId}")
    public ResponseEntity<OrderDTO> createOrderFromCart(@PathVariable String cartId) {
        // Create the order from the cart
        OrderDTO order = orderService.createOrderFromCart(cartId);
        return ResponseEntity.ok(order);
    }

    // Endpoint for supplier to view all their orders
//    @PreAuthorize("hasRole('ROLE_SUPPLIER')")
    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<OrderDTO>> getOrdersBySupplier(@PathVariable String supplierId) {
        List<OrderDTO> orders = orderService.getOrdersBySupplierId(supplierId);
        return ResponseEntity.ok(orders);
    }

    // Endpoint for supplier to update the status of an order item
//    @PreAuthorize("hasRole('ROLE_SUPPLIER')")
    @PutMapping("/{orderId}/items/{itemId}/status")
    public ResponseEntity<OrderItemDTO> updateOrderItemStatus(
            @PathVariable String orderId,
            @PathVariable String itemId,
            @RequestParam OrderItemStatus status) {
        
        OrderItemDTO updatedItem = orderService.updateOrderItemStatus(orderId, itemId, status);
        return ResponseEntity.ok(updatedItem);
    }
    
    
    @PutMapping("/{orderId}/items/{itemId}/fulfill")
    public ResponseEntity<OrderItemDTO> fulfillOrderItem(
            @PathVariable String orderId,
            @PathVariable String itemId,
            @RequestParam(required = false) Double unitPrice,
            @RequestParam(required = false) Integer fulfilledQuantity) {

        // Updated the service method to accept fulfilledQuantity as an argument
        OrderItemDTO updatedItem = orderService.fulfillOrderItem(orderId, itemId, unitPrice, fulfilledQuantity);
        return ResponseEntity.ok(updatedItem);
    }

}
