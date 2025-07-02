package com.sattva.util;

import java.time.LocalDateTime;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.sattva.enums.OrderAction;
import com.sattva.model.Order;
import com.sattva.model.OrderAudit;
import com.sattva.model.User;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreRemove;
import jakarta.persistence.PreUpdate;

public class OrderAuditListener {

    @PrePersist
    public void prePersist(Order order) {
        addOrderAudit(order, OrderAction.CREATED);
    }

    @PreUpdate
    public void preUpdate(Order order) {
        addOrderAudit(order, OrderAction.UPDATED);
    }

    @PreRemove
    public void preRemove(Order order) {
        addOrderAudit(order, OrderAction.DELETED);
    }

    private void addOrderAudit(Order order, OrderAction action) {
        OrderAudit orderAudit = OrderAudit.builder()
                .orderId(order.getId())
                .action(action)
                .timestamp(LocalDateTime.now())
                .changedByUserId(getCurrentUserId()) // Implement to fetch the current user ID
                .details(order.toString()) // Could be improved to show meaningful changes
                .build();

        // Persist the audit entry
        EntityManagerFactory entityManagerFactory = Persistence.createEntityManagerFactory("persistence");
        EntityManager entityManager = entityManagerFactory.createEntityManager();
        entityManager.getTransaction().begin();
        entityManager.persist(orderAudit);
        entityManager.getTransaction().commit();
        entityManager.close();
    }

    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getPrincipal() instanceof User
                ? ((User) auth.getPrincipal()).getId()
                : "SYSTEM";
    }
}
