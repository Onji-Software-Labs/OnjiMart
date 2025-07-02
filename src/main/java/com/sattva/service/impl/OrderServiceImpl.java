package com.sattva.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sattva.dto.OrderDTO;
import com.sattva.dto.OrderItemDTO;
import com.sattva.enums.OrderItemStatus;
import com.sattva.enums.OrderStatus;
import com.sattva.model.AggregateOrder;
import com.sattva.model.Cart;
import com.sattva.model.Order;
import com.sattva.model.OrderItem;
import com.sattva.model.Product;
import com.sattva.model.ProductAggregate;
import com.sattva.model.Shop;
import com.sattva.repository.AggregateOrderRepository;
import com.sattva.repository.CartRepository;
import com.sattva.repository.OrderItemRepository;
import com.sattva.repository.OrderRepository;
import com.sattva.service.AggregateOrderService;
import com.sattva.service.OrderService;

import jakarta.transaction.Transactional;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private AggregateOrderService aggregateOrderService;

    @Autowired
    private ModelMapper modelMapper;
    
    @Autowired
    AggregateOrderRepository aggregateOrderRepository;

    @Transactional
    @Override
    public OrderDTO createOrderFromCart(String cartId) {
        // Step 1: Fetch the cart by cartId
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found with id: " + cartId));

        // Step 2: Create a new order and set its relationships
        Order order = new Order();
        order.setShop(cart.getShop()); // Set the shop from the cart
        order.setSupplier(cart.getSupplier()); // Set the supplier from the cart

        // Set the retailer from the shop
        Shop shop = cart.getShop();
        if (shop == null || shop.getRetailer() == null) {
            throw new RuntimeException("Shop or Retailer information is missing in the cart");
        }
        order.setRetailer(shop.getRetailer()); // Set retailer of the order

        // Set Order date and default status
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.NEW);
        order.setIsCompleted(false);

        // Step 3: Convert cart items to order items
        Set<OrderItem> orderItems = cart.getItems().stream()
                .map(cartItem -> {
                    OrderItem orderItem = new OrderItem();
                    orderItem.setOrder(order); // Link each order item back to the order
                    orderItem.setProduct(cartItem.getProduct());
                    orderItem.setRequestedQuantity(cartItem.getQuantity());
                    orderItem.setStatus(OrderItemStatus.PENDING); // Set default status
                    return orderItem;
                })
                .collect(Collectors.toSet());

        // Add the items to the order
        order.setItems(orderItems);

        // Step 4: Save the new order and delete the cart if needed
        orderRepository.save(order);

        // Step 5: Add the order items to the aggregate order for the day
        aggregateOrderService.addToAggregate(order);

        // Optional: delete the cart after creating the order if no longer needed
        cartRepository.delete(cart);

        // Convert order to DTO and return it
        return modelMapper.map(order, OrderDTO.class);
    }

    @Override
    public List<OrderDTO> getOrdersBySupplierId(String supplierId) {
        List<Order> orders = orderRepository.findBySupplier_Id(supplierId);
        return orders.stream()
                .map(order -> modelMapper.map(order, OrderDTO.class))
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public OrderItemDTO updateOrderItemStatus(String orderId, String itemId, OrderItemStatus status) {
        OrderItem orderItem = orderItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("OrderItem not found with ID: " + itemId));

        // Update the status of the item
        orderItem.setStatus(status);
        if (status == OrderItemStatus.FULFILLED) {
            orderItem.setFulfilled(true);
            orderItem.setBackordered(false);
            orderItem.setEditable(false);

            // Step 6: Remove fulfilled items from the aggregate
            aggregateOrderService.removeFromAggregate(orderItem.getOrder());
        } else if (status == OrderItemStatus.BACKORDERED) {
            orderItem.setBackordered(true);
            orderItem.setFulfilled(false);
        } else if (status == OrderItemStatus.OUT_OF_STOCK) {
            orderItem.setFulfilled(false);
            orderItem.setBackordered(false);
        }

        OrderItem updatedItem = orderItemRepository.save(orderItem);
        return convertToOrderItemDTO(updatedItem);
    }

    private OrderItemDTO convertToOrderItemDTO(OrderItem orderItem) {
        return modelMapper.map(orderItem, OrderItemDTO.class);
    }

    @Override
    @Transactional
    public OrderItemDTO fulfillOrderItem(String orderId, String itemId, Double unitPrice, Integer fulfilledQuantity) {
        // Step 1: Fetch the order and order item
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
        OrderItem orderItem = orderItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("OrderItem not found with ID: " + itemId));

        // Step 2: Check if the item is editable
        if (!orderItem.isEditable()) {
            throw new RuntimeException("This order item is no longer editable.");
        }

        // Step 3: Fetch the aggregate order for today's date
        LocalDate today = LocalDate.now();
        AggregateOrder aggregateOrder = aggregateOrderRepository
                .findBySupplierAndAggregateDate(order.getSupplier(), today)
                .orElseThrow(() -> new RuntimeException("Aggregate order not found for supplier: " + order.getSupplier().getId() + " for today."));

        // Step 4: Find the product aggregate for the order item
        Product product = orderItem.getProduct();
        ProductAggregate productAggregate = aggregateOrder.getProductAggregates().stream()
                .filter(pa -> pa.getProduct().getProductId().equals(product.getProductId()))
                .findFirst()
                .orElse(null); // Handle null case if not found

        // Step 5: Determine the unit price
        if (productAggregate != null && productAggregate.getUnitPrice() != null) {
            // Use the unit price from the aggregate if available
            unitPrice = productAggregate.getUnitPrice();
        } else if (unitPrice == null) {
            // Throw an exception if no unit price is available and none was provided
            throw new RuntimeException("Unit price is not available in the aggregate data. Please provide a price to fulfill the order item.");
        }

        // Step 6: Update the order item with the fulfilled quantity, unit price, and total price
        if (fulfilledQuantity != null) {
            orderItem.setRequestedQuantity(fulfilledQuantity);
        } else {
            orderItem.setRequestedQuantity(orderItem.getRequestedQuantity()); // Use existing quantity if not provided
        }

        orderItem.setUnitPrice(unitPrice);
        orderItem.setTotalPrice(unitPrice * orderItem.getRequestedQuantity());

        // Step 7: Mark the item as fulfilled and not editable
        orderItem.setFulfilled(true);
        orderItem.setEditable(false);

        // Step 8: Save the updated order item
        OrderItem updatedItem = orderItemRepository.save(orderItem);

        // Step 9: Update the aggregate order quantity if product aggregate exists
        if (productAggregate != null) {
            productAggregate.setTotalQuantity(productAggregate.getTotalQuantity() - orderItem.getRequestedQuantity());
            aggregateOrder.setDateModified(LocalDateTime.now());
            aggregateOrderRepository.save(aggregateOrder);
        }

        // Convert the order item to DTO and return
        return modelMapper.map(updatedItem, OrderItemDTO.class);
    }

}
