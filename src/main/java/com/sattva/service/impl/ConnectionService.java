package com.sattva.service.impl;

import com.sattva.enums.ConnectionStatus;
import com.sattva.exception.ResourceNotFoundException;
import com.sattva.model.Connection;
import com.sattva.repository.ConnectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

import java.util.Optional;

@Service
public class ConnectionService {

    @Autowired
    private ConnectionRepository repo;

    // Create a connection request and track who initiated it
    public Connection connect(String retailerId, String supplierId, String initiatedBy) {

        Optional<Connection> existing = repo.findByRetailerIdAndSupplierId(retailerId, supplierId);
        if (existing.isPresent()) {
            Connection conn = existing.get();

        // Auto-accept connection when both retailer and supplier send requests to each other
        if (conn.getStatus() == ConnectionStatus.PENDING) {
            conn.setStatus(ConnectionStatus.ACCEPTED);
            return repo.save(conn);
        }

        return conn;
    }

        Connection conn = new Connection();
        conn.setRetailerId(retailerId);
        conn.setSupplierId(supplierId);
        // Store who initiated the connection request
        conn.setInitiatedBy(initiatedBy);
        conn.setStatus(ConnectionStatus.PENDING);
        return repo.save(conn);
    }

    public void cancel(String retailerId, String supplierId) {
        repo.findByRetailerIdAndSupplierId(retailerId, supplierId)
                .ifPresent(repo::delete);
    }

    public Optional<Connection> getStatus(String retailerId, String supplierId) {
        return repo.findByRetailerIdAndSupplierId(retailerId, supplierId);
    }

    // Accept a connection request (from supplier side)
    public Optional<Connection> accept(String retailerId, String supplierId) {
        return repo.findByRetailerIdAndSupplierId(retailerId, supplierId)
                .map(conn -> {
                    if(conn.getStatus() == ConnectionStatus.PENDING) {
                        conn.setStatus(ConnectionStatus.ACCEPTED);
                        return repo.save(conn);
                    }
                    return conn;
                });
    }

    // Reject a connection request (from supplier side)
    public Optional<Connection> rejectConnection(String retailerId, String supplierId){
        return repo.findByRetailerIdAndSupplierId(retailerId, supplierId)
                .map(conn -> {
                    if(conn.getStatus() == ConnectionStatus.PENDING) {
                        conn.setStatus(ConnectionStatus.CANCELLED);
                        return repo.save(conn);
                    }
                    return conn;
                });
    }
    // Fetch pending requests sent by retailers to a supplier
    // public List<Connection> getPendingRequests(String supplierId) {
    //     return repo.findBySupplierIdAndStatus(supplierId, ConnectionStatus.PENDING);
    // }

    // Fetch pending requests sent by retailers to a supplier
    public List<Connection> getPendingRequests(String supplierId) {return repo.findBySupplierIdAndStatusAndInitiatedBy(supplierId,
                ConnectionStatus.PENDING,
                "RETAILER");
    }

    // Fetch all pending connection requests for a retailer
    // public List<Connection> getPendingRequestsForRetailer(String retailerId) {
    //     return repo.findByRetailerIdAndStatus(retailerId,ConnectionStatus.PENDING);
    // }

   // Fetch pending requests sent by suppliers to a retailer
    public List<Connection> getPendingRequestsForRetailer(String retailerId) {
        return repo.findByRetailerIdAndStatusAndInitiatedBy(
                retailerId,
                ConnectionStatus.PENDING,
                "SUPPLIER"
        );
    }

}
