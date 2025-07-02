package com.sattva.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sattva.model.Shop;

public interface ShopRepository extends JpaRepository<Shop, String> {
	List<Shop> findByCity(String city);
}
