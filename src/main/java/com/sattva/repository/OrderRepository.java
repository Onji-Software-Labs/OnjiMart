package com.sattva.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sattva.model.Order;

public interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findBySupplier_Id(String supplierId);
}
