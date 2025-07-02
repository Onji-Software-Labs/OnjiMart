package com.sattva.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.UuidGenerator;

import com.sattva.enums.OrderAction;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "orders_audit")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderAudit {

    @Id
    @UuidGenerator
    private String id;

    @Column(name = "order_id", nullable = false)
    private String orderId;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false)
    private OrderAction action; // CREATED, UPDATED, DELETED

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "changed_by_user_id", nullable = false)
    private String changedByUserId;

    @Column(name = "details", columnDefinition = "TEXT")
    private String details; // JSON or a descriptive text explaining what changed
}
