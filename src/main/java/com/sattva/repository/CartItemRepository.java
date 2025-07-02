package com.sattva.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sattva.model.Cart;
import com.sattva.model.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem, String> {
	
	Optional<CartItem> findByCart_IdAndProduct_ProductId(String cartId, String productId);

}