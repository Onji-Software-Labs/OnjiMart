package com.sattva.model;

import com.sattva.enums.ConnectionStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "connections")
public class Connection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String retailerId;

    private String supplierId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConnectionStatus status; // e.g., PENDING, ACCEPTED, CANCELED

    private LocalDateTime createdAt = LocalDateTime.now();

    // ----- Getters -----
    public Long getId() {
        return id;
    }

    public String getRetailerId() {
        return retailerId;
    }

    public String getSupplierId() {
        return supplierId;
    }

    public ConnectionStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // ----- Setters -----
    public void setId(Long id) {
        this.id = id;
    }

    public void setRetailerId(String retailerId) {
        this.retailerId = retailerId;
    }

    public void setSupplierId(String supplierId) {
        this.supplierId = supplierId;
    }

    public void setStatus(ConnectionStatus status) {
        this.status = status;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
