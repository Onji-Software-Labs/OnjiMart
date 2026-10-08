package com.sattva.repository;

import com.sattva.model.SupplierBusiness;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupplierBusinessRepository extends JpaRepository<SupplierBusiness, String> {
    List<SupplierBusiness> findAll();
    List<SupplierBusiness> findByPincode(String pincode);
    Optional<SupplierBusiness> findBySupplier_Id(String supplierId);
    List<SupplierBusiness> findTop5ByNameIgnoreCaseContaining(String keyword);
}
