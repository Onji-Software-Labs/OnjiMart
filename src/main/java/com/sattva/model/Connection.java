package com.sattva.model;

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

    private String status; // e.g., PENDING, ACCEPTED, CANCELED

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

    public String getStatus() {
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

    public void setStatus(String status) {
        this.status = status;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
