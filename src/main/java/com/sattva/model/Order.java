package com.sattva.model;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import org.hibernate.annotations.UuidGenerator;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.sattva.enums.OrderStatus;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
@Entity
@Table(name = "orders")
@Getter
@Setter
public class Order {

    @Id
    @UuidGenerator
    private String id;

    @ManyToOne
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @ManyToOne
    @JoinColumn(name = "shop_id", nullable = false)
    private Shop shop;

    @ManyToOne
    @JoinColumn(name = "retailer_id", nullable = false)
    private Retailer retailer;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<OrderItem> items = new HashSet<>();

    private LocalDateTime orderDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private OrderStatus status;

    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted;

    // New Tracking Fields
    @Column(name = "date_entered", nullable = false, updatable = false)
    private LocalDateTime dateEntered;

    @Column(name = "date_modified", nullable = false)
    private LocalDateTime dateModified;

    @Column(name = "created_user_id", nullable = false, updatable = false)
    private String createdUserId;

    @Column(name = "modified_user_id", nullable = false)
    private String modifiedUserId;

    // Callback methods for setting dates and user IDs
    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.dateEntered = now;
        this.dateModified = now;

        // Assuming currentUserId can be fetched from the context (like a security context)
        String currentUserId = getCurrentUserId();
        this.createdUserId = currentUserId;
        this.modifiedUserId = currentUserId;
        this.orderDate = now;
        this.status = OrderStatus.NEW;
        this.isCompleted = false;
    }

    @PreUpdate
    protected void onUpdate() {
        this.dateModified = LocalDateTime.now();
        this.modifiedUserId = getCurrentUserId();
    }

    // Helper method to fetch current user ID from security context (this is an example)
    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User) {
            User user = (User) auth.getPrincipal();
            return user.getId(); // Return the user ID instead of username
        }
        return "SYSTEM";
    }
}

