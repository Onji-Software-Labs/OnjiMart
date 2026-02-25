package com.sattva.repository;

import com.sattva.model.Connection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ConnectionRepository extends JpaRepository<Connection, Long> {
    Optional<Connection> findByRetailerIdAndSupplierId(String retailerId, String supplierId);
}
