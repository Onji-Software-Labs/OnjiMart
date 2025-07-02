package com.sattva.model;

import java.time.LocalDateTime;
import java.util.List;

import com.sattva.enums.InvoiceStatus;
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
@Table(name = "invoices")
@Getter
@Setter
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "shop_id", nullable = false)
    private Shop shop;

    @ManyToOne
    @JoinColumn(name = "retailer_id", nullable = false)
    private Retailer retailer;

    @ManyToOne
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Column(name = "invoice_date", nullable = false)
    private LocalDateTime invoiceDate;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InvoiceOrderItem> invoiceOrderItems;

    @Column(name = "total_price", nullable = false)
    private double grandTotal; // Grand total for the invoice

    @Column(name = "delivery_charge", nullable = true)
    private Double deliveryCharge; // Delivery charge, can be null if not applicable

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private InvoiceStatus status; // PENDING, GENERATED, PAID

    @Column(name = "date_entered", nullable = false, updatable = false)
    private LocalDateTime dateEntered;

    @Column(name = "date_modified", nullable = false)
    private LocalDateTime dateModified;

    @Column(name = "modified_user_id", nullable = false)
    private String modifiedUserId;

    @PrePersist
    protected void onCreate() {
        this.dateEntered = LocalDateTime.now();
        this.dateModified = LocalDateTime.now();
        this.status = InvoiceStatus.PENDING;
        this.modifiedUserId = SecurityUtil.getCurrentUserId(); // Set the current user ID
    }

    @PreUpdate
    protected void onUpdate() {
        this.dateModified = LocalDateTime.now();
        this.modifiedUserId = SecurityUtil.getCurrentUserId(); // Update the current user ID
    }
}
