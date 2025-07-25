package com.sattva.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.sattva.model.Supplier;

public interface SupplierRepository extends JpaRepository<Supplier, String> {
    List<Supplier> findDistinctByCategories_IdIn(List<String> categoryIds);
}
