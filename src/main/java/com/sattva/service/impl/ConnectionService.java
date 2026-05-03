package com.sattva.service.impl;

import com.sattva.enums.ConnectionStatus;
import com.sattva.exception.ResourceNotFoundException;
import com.sattva.model.Connection;
import com.sattva.repository.ConnectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

import java.util.Optional;
import java.util.List;
import com.sattva.model.User;
import com.sattva.enums.UserType;
import com.sattva.repository.UserRepository;
import java.util.stream.Collectors;

@Service
public class ConnectionService {

    @Autowired
    private ConnectionRepository repo;

    @Autowired
    private UserRepository userRepository;

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
    // Fetch allgit commit -m "Add API to fetch pending connection requests for supplier notifications" pending connection requests for a supplier (used for notifications)
    public List<Connection> getPendingRequests(String supplierId) {
        return repo.findBySupplierIdAndStatus(supplierId, ConnectionStatus.PENDING);
    }
    // ✅ NEW METHOD — Get all retailers NOT connected with this supplier
    public List<User> getUnconnectedRetailers(String supplierId) {

        // Step 1: Get all retailerIds already connected with this supplier
        List<String> connectedRetailerIds = repo.findBySupplierId(supplierId)
                .stream()
                .map(Connection::getRetailerId)
                .collect(Collectors.toList());

        // Step 2: Return retailers NOT in that list
        if (connectedRetailerIds.isEmpty()) {
            // No connections yet — return ALL retailers
            return userRepository.findByUserType(UserType.RETAILER);
        }

        return userRepository.findByUserTypeAndIdNotIn(UserType.RETAILER, connectedRetailerIds);
    }

}
