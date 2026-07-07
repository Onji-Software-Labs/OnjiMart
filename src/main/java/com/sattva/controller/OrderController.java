package com.sattva.controller;

import com.sattva.dto.OrderDTO;
import com.sattva.dto.OrderItemDTO;
import com.sattva.dto.CreateOrderRequestDTO;
import com.sattva.dto.EditOrderRequestDTO;
import com.sattva.enums.OrderItemStatus;
import com.sattva.enums.OrderStatus;
import com.sattva.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Arrays;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin
public class OrderController {

    @Autowired
    private OrderService orderService;

    // Endpoint for retailer to create an order from a cart
//    @PreAuthorize("hasRole('ROLE_RETAILER')")
    @PostMapping("/submit")
    public ResponseEntity<OrderDTO> createOrderFromCart(@RequestBody CreateOrderRequestDTO request) {
        // Create the order from the cart
        OrderDTO order = orderService.createOrderFromCart(request);
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
    // Endpoint for retailer to view all orders
    @GetMapping("/retailer/{retailerId}")
    public ResponseEntity<List<OrderDTO>> getAllOrdersByRetailer(
            @PathVariable String retailerId) {

        List<OrderDTO> orders =
                orderService.getOrdersByRetailerId(retailerId);

        return ResponseEntity.ok(orders);
    }

    // Endpoint for retailer to view orders by filter
    @GetMapping("/retailer/{retailerId}/filter")
    public ResponseEntity<List<OrderDTO>> getOrdersByRetailer(
            @PathVariable String retailerId,
            @RequestParam String filter) {

        List<OrderStatus> statuses;

        // Map UI filter to backend statuses
        if (filter.equalsIgnoreCase("ACTIVE")) {
            statuses = Arrays.asList(
                    OrderStatus.NEW,
                    OrderStatus.PROCESSING
            );
        } else if (filter.equalsIgnoreCase("DELIVERED")) {
            statuses = Arrays.asList(
                    OrderStatus.COMPLETED
            );
        } else {
            throw new IllegalArgumentException("Invalid filter value");
        }

        // Fetch retailer orders
        List<OrderDTO> orders =
                orderService.getOrdersByRetailerIdAndStatus(
                        retailerId,
                        statuses
                );

        return ResponseEntity.ok(orders);
    }

    // Endpoint for retailer to view orders for specific supplier
    @GetMapping("/retailer/{retailerId}/supplier/{supplierId}")
    public ResponseEntity<List<OrderDTO>> getOrdersByRetailerAndSupplier(
            @PathVariable String retailerId,
            @PathVariable String supplierId) {

        // Fetch retailer orders for specific supplier
        List<OrderDTO> orders =
                orderService.getOrdersByRetailerAndSupplier(
                        retailerId,
                        supplierId
                );

        return ResponseEntity.ok(orders);
    }

    // Endpoint for supplier to view orders by filter
    @GetMapping("/supplier/{supplierId}/filter")
    public ResponseEntity<List<OrderDTO>> getOrdersBySupplierAndStatus(@PathVariable String supplierId,@RequestParam String filter) {

        List<OrderStatus> statuses;

        // Map UI filter to backend statuses
        if (filter.equalsIgnoreCase("NEW")) {
            statuses = Arrays.asList(
                    OrderStatus.NEW
            );
            } else if (filter.equalsIgnoreCase("ACTIVE")) {
                statuses = Arrays.asList(
                        OrderStatus.PROCESSING
                );
            } else if (filter.equalsIgnoreCase("DELIVERED")) {
                statuses = Arrays.asList(
                        OrderStatus.COMPLETED
                );
            } else {
                throw new IllegalArgumentException("Invalid filter value");
            }

        // Fetch supplier orders
        List<OrderDTO> orders =
                orderService.getOrdersBySupplierIdAndStatus(
                        supplierId,
                        statuses
                );

        return ResponseEntity.ok(orders);
    }

    // Endpoint for supplier to view orders for specific retailer
    @GetMapping("/supplier/{supplierId}/retailer/{retailerId}")
    public ResponseEntity<List<OrderDTO>> getOrdersBySupplierAndRetailer(
            @PathVariable String supplierId,
            @PathVariable String retailerId) {

        // Fetch supplier orders for specific retailer
        List<OrderDTO> orders =
                orderService.getOrdersBySupplierAndRetailer(
                        supplierId,
                        retailerId
                );

        return ResponseEntity.ok(orders);
    }

    // Endpoint to get retailer order details by order ID
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDTO> getOrderById(
            @PathVariable String orderId) {

        // Fetch order details
        OrderDTO order = orderService.getOrderById(orderId);

        return ResponseEntity.ok(order);
    }

    // Edit all order items before supplier confirms the order.
    // This API only saves the edited values.
    @PutMapping("/{orderId}/edit")
    public ResponseEntity<OrderDTO> editOrder(
            @PathVariable String orderId,
            @RequestBody EditOrderRequestDTO request) {

        return ResponseEntity.ok(
                orderService.editOrder(orderId, request)
        );
    }

}
