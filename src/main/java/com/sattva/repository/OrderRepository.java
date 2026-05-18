package com.sattva.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sattva.model.Order;

import com.sattva.enums.OrderStatus;

public interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findBySupplier_Id(String supplierId);

    //Get retailer orders by statuses
    List<Order> findByRetailer_IdAndStatusIn(String retailerId, List<OrderStatus> statuses);

    // Get retailer orders for specific supplier by statuses
    List<Order> findByRetailer_IdAndSupplier_IdAndStatusIn(String retailerId,String supplierId,List<OrderStatus> statuses);
}

