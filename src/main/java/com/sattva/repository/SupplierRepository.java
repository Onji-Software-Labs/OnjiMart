package com.sattva.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.sattva.model.Supplier;

public interface SupplierRepository extends JpaRepository<Supplier, String> {
    Page<Supplier> findAll(Pageable pageable);
    List<Supplier> findDistinctByCategories_IdIn(List<String> categoryIds);
    List<Supplier> findByIdIn(List<String> ids);
    @Query("""
        SELECT s FROM Supplier s
        WHERE s.id NOT IN (
            SELECT c.supplierId FROM Connection c
            WHERE c.retailerId = :retailerId
        )
    """)
    Page<Supplier> findUnconnectedSuppliers(@Param("retailerId") String retailerId, Pageable pageable);

}
