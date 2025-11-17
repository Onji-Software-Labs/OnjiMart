package com.sattva.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.sattva.enums.AggregateOrderStatus;
import com.sattva.util.SecurityUtil;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
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
@Table(name = "aggregate_orders")
@Getter
@Setter
public class AggregateOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier; // The supplier this aggregate belongs to

    @Column(name = "aggregate_date", nullable = false)
    private LocalDate aggregateDate; // The date for which this aggregation is tracked

    @OneToMany(mappedBy = "aggregateOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductAggregate> productAggregates = new ArrayList<>(); // List of products and their aggregate quantities

    @Column(name = "date_entered", nullable = false, updatable = false)
    private LocalDateTime dateEntered; // Date when the aggregate order was created

    @Column(name = "date_modified", nullable = false)
    private LocalDateTime dateModified; // Date when the aggregate order was last modified

    @Column(name = "modified_user_id", nullable = false)
    private String modifiedUserId; // ID of the user/system that modified the entity
    @Column(name = "is_completed", nullable = false)
    private boolean isCompleted = false; 
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AggregateOrderStatus status;

    @PrePersist
    protected void onCreate() {
        this.dateEntered = LocalDateTime.now();
        this.dateModified = LocalDateTime.now();
        this.modifiedUserId = SecurityUtil.getCurrentUserId();
        if (this.status == null) {
            this.status = AggregateOrderStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.dateModified = LocalDateTime.now();
        this.modifiedUserId = SecurityUtil.getCurrentUserId();
    }
}