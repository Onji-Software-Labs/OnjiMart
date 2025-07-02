package com.sattva.service;

import java.util.List;

import com.sattva.dto.CartDTO;
import com.sattva.dto.CartItemDTO;

public interface CartService {

    // Add a product to the cart for a specific shop
	public CartDTO addProductToCart(String shopId, String supplierId, String productId, int quantity);

    // Get the cart for a specific shop
    CartDTO getCartByShop(String shopId);

    // Remove a product from the cart
    CartDTO removeProductFromCart(String cartId, String productId);

    // Update the quantity of a product in the cart
    CartDTO updateProductQuantity(String cartId, String productId, int quantity);

    // Get all cart items for a specific cart
    List<CartItemDTO> getAllCartItems(String cartId);
    
    List<CartItemDTO> getCartItemsByShopAndSupplier(String shopId, String supplierId);
}