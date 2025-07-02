package com.sattva.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sattva.model.Retailer;

public interface RetailerRepository extends JpaRepository<Retailer, String> {

}
