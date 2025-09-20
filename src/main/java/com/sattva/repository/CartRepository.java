package com.sattva.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sattva.model.Cart;

import java.util.List;

public interface CartRepository extends JpaRepository<Cart, String> {

    /**
     * Retrieve a cart by the ID of its associated shop.
     *
     * <p>Using the nested property path {@code Shop#id} ensures Spring Data JPA
     * creates the correct query method. The previous method name
     * {@code findByShopId} looked for a property named {@code shopId} on the
     * {@link Cart} entity, which does not exist and would cause an
     * {@link org.springframework.beans.factory.BeanCreationException} when the
     * repository was initialized.</p>
     */
    List<Cart> findByShop_Id(String shopId);

	Cart findByShop_IdAndSupplier_Id(String shopId, String supplierId);
}