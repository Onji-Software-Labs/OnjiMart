package com.sattva.repository;

import com.sattva.model.RetailerBusiness;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RetailerBusinessRepository extends JpaRepository<RetailerBusiness, String> {
    List<RetailerBusiness> findAll();
    List<RetailerBusiness> findByPincode(String pincode);
}
