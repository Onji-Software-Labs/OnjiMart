package com.sattva.service.impl;

import com.sattva.enums.ConnectionStatus;
import com.sattva.model.Connection;
import com.sattva.repository.ConnectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ConnectionService {

    @Autowired
    private ConnectionRepository repo;

    public Connection connect(String retailerId, String supplierId) {
        Optional<Connection> existing = repo.findByRetailerIdAndSupplierId(retailerId, supplierId);
        if (existing.isPresent()) {
            return existing.get();
        }

        Connection conn = new Connection();
        conn.setRetailerId(retailerId);
        conn.setSupplierId(supplierId);
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

}
