package com.sattva.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sattva.model.Order;

import com.sattva.enums.OrderStatus;

public interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findBySupplier_Id(String supplierId);

    // Get all retailer orders
    List<Order> findByRetailer_Id(String retailerId);

    //Get retailer orders by statuses
    List<Order> findByRetailer_IdAndStatusIn(String retailerId, List<OrderStatus> statuses);

    // Get retailer orders for specific supplier
    List<Order> findByRetailer_IdAndSupplier_Id(String retailerId,String supplierId);

    // Get supplier orders by statuses
    List<Order> findBySupplier_IdAndStatusIn(String supplierId,List<OrderStatus> statuses);

    // Get supplier orders for specific retailer
    List<Order> findBySupplier_IdAndRetailer_Id(String supplierId,String retailerId);

}

