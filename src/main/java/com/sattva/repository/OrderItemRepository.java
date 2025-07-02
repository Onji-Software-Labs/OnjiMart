package com.sattva.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sattva.model.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, String> {
}
