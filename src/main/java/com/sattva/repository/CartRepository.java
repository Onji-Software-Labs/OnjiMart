package com.sattva.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sattva.model.Cart;

public interface CartRepository extends JpaRepository<Cart, String> {

    Cart findByShopId(String shopId); // Retrieve cart by shopId

	Cart findByShop_IdAndSupplier_Id(String shopId, String supplierId);
}