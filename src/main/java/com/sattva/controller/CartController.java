package com.sattva.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sattva.dto.CartDTO;
import com.sattva.dto.CartItemDTO;
import com.sattva.service.CartService;

@RestController
@RequestMapping("/api/carts")
@CrossOrigin
public class CartController {

    @Autowired
    private CartService cartService;

    // Endpoint to add a product to a cart by specifying shopId, productId, and quantity
    @PreAuthorize("hasRole('ROLE_RETAILER')")
    @PostMapping("/{shopId}/{supplierId}/add")
    public ResponseEntity<CartDTO> addProductToCart(
            @PathVariable String shopId,
            @PathVariable String supplierId,
            @RequestParam String productId,
            @RequestParam int quantity) { 
        
        CartDTO updatedCart = cartService.addProductToCart(shopId, supplierId, productId, quantity);
        return ResponseEntity.ok(updatedCart);
    }

    // Endpoint to get the cart details for a specific shop
    @PreAuthorize("hasRole('ROLE_RETAILER')")
    @GetMapping("/{shopId}")
    public ResponseEntity<List<CartDTO>> getCartByShop(@PathVariable String shopId) {
        List<CartDTO> cart = cartService.getCartByShop(shopId);
        return ResponseEntity.ok(cart);
    }

    // Endpoint to remove a product from the cart
   
    @DeleteMapping("/{cartId}/remove")
    public ResponseEntity<CartDTO> removeProductFromCart(
            @PathVariable String cartId,
            @RequestParam String productId) {
        
        CartDTO updatedCart = cartService.removeProductFromCart(cartId, productId);
        return ResponseEntity.ok(updatedCart);
    }

    // Endpoint to update the quantity of a product in the cart
    @PreAuthorize("hasRole('ROLE_RETAILER')")
    @PutMapping("/{cartId}/update")
    public ResponseEntity<CartDTO> updateProductQuantity(
            @PathVariable String cartId,
            @RequestParam String productId,
            @RequestParam int quantity) {
        
        CartDTO updatedCart = cartService.updateProductQuantity(cartId, productId, quantity);
        return ResponseEntity.ok(updatedCart);
    }

    // Endpoint to get all cart items for a specific cart
    @PreAuthorize("hasRole('ROLE_RETAILER')")
    @GetMapping("/{cartId}/items")
    public ResponseEntity<List<CartItemDTO>> getAllCartItems(@PathVariable String cartId) {
        List<CartItemDTO> cartItems = cartService.getAllCartItems(cartId);
        return ResponseEntity.ok(cartItems);
    }
    @PreAuthorize("hasRole('ROLE_RETAILER')")
    @GetMapping("/{shopId}/{supplierId}/items")
    public ResponseEntity<List<CartItemDTO>> getCartItemsByShopAndSupplier(
            @PathVariable String shopId,
            @PathVariable String supplierId) {

        List<CartItemDTO> cartItems = cartService.getCartItemsByShopAndSupplier(shopId, supplierId);
        return ResponseEntity.ok(cartItems);
    }
}