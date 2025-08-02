package com.sattva.service.impl;

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
        conn.setStatus("CONNECTED");
        return repo.save(conn);
    }

    public void cancel(String retailerId, String supplierId) {
        repo.findByRetailerIdAndSupplierId(retailerId, supplierId)
                .ifPresent(repo::delete);
    }

    public Optional<Connection> getStatus(String retailerId, String supplierId) {
        return repo.findByRetailerIdAndSupplierId(retailerId, supplierId);
    }
}
