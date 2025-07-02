package com.sattva.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sattva.model.Supplier;

public interface SupplierRepository extends JpaRepository<Supplier, String> {

}
