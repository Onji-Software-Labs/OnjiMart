package com.sattva.repository;

import com.sattva.enums.ConnectionStatus;
import com.sattva.model.Connection;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import java.util.Optional;

public interface ConnectionRepository extends JpaRepository<Connection, Long> {
    Optional<Connection> findByRetailerIdAndSupplierId(String retailerId, String supplierId);

    List<Connection> findByRetailerIdAndStatus(String retailerId, ConnectionStatus status);
}
