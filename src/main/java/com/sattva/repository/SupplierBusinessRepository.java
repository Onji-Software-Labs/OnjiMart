package com.sattva.repository;

import com.sattva.model.SupplierBusiness;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupplierBusinessRepository extends JpaRepository<SupplierBusiness, String> {
    
}
