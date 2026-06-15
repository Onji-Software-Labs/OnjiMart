package com.sattva.repository;

import com.sattva.enums.ConnectionStatus;
import com.sattva.model.Connection;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import java.util.Optional;

public interface ConnectionRepository extends JpaRepository<Connection, Long> {
    Optional<Connection> findByRetailerIdAndSupplierId(String retailerId, String supplierId);

    List<Connection> findByRetailerIdAndStatus(String retailerId, ConnectionStatus status);

    //Fetch all pending requests for the supplier
    List<Connection> findBySupplierIdAndStatus(String supplierId, ConnectionStatus status);

    // Fetch pending requests sent by suppliers to a retailer
    List<Connection> findByRetailerIdAndStatusAndInitiatedBy(String retailerId,ConnectionStatus status,String initiatedBy);

    // Fetch pending requests sent by retailers to a supplier
    List<Connection> findBySupplierIdAndStatusAndInitiatedBy(String supplierId,ConnectionStatus status,String initiatedBy);

    //Fetch all connection records for a retailer-supplier pair
    List<Connection> findAllByRetailerIdAndSupplierId(String retailerId,String supplierId);
}
