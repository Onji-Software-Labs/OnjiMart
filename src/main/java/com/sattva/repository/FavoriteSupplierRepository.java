package com.sattva.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sattva.model.FavoriteSupplier;
import com.sattva.model.Supplier;

public interface FavoriteSupplierRepository extends JpaRepository<FavoriteSupplier, Long> {

    Optional<FavoriteSupplier> findByUserIdAndSupplier(String userId, Supplier supplier);

    List<FavoriteSupplier> findByUserId(String userId);

}