package com.sattva.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sattva.dto.CartDTO;
import com.sattva.dto.CartItemDTO;
import com.sattva.model.Cart;
import com.sattva.model.CartItem;
import com.sattva.model.Product;
import com.sattva.model.Shop;
import com.sattva.model.Supplier;
import com.sattva.repository.CartItemRepository;
import com.sattva.repository.CartRepository;
import com.sattva.repository.ProductRepository;
import com.sattva.repository.ShopRepository;
import com.sattva.repository.SupplierRepository;
import com.sattva.service.CartService;

@Service
public class CartServiceImpl implements CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ModelMapper modelMapper; // Using ModelMapper for mapping

    @Autowired
    private SupplierRepository supplierRepository;
    @Override
    public CartDTO addProductToCart(String shopId, String supplierId, String productId, int quantity) {
        // Fetch the shop by shopId
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found with id: " + shopId));

        // Fetch the supplier by supplierId
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + supplierId));

        // Declare cart as final
        final Cart cart;

        // Find an existing cart for the shop and supplier, or create a new one if none exists
        Cart existingCart = cartRepository.findByShop_IdAndSupplier_Id(shopId, supplierId);
        if (existingCart == null) {
            Cart newCart = new Cart();
            newCart.setShop(shop);
            newCart.setSupplier(supplier);
            cart = cartRepository.save(newCart); // Assign newly created cart to final variable
        } else {
            cart = existingCart; // Assign the existing cart to final variable
        }

        // Fetch the product by productId
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        // Check if the product already exists in the cart
        CartItem cartItem = cartItemRepository.findByCart_IdAndProduct_ProductId(cart.getId(), productId)
                .orElseGet(() -> {
                    CartItem newCartItem = new CartItem();
                    newCartItem.setCart(cart);
                    newCartItem.setProduct(product);
                    newCartItem.setQuantity(0); // Initial quantity set to 0 for further addition
                    return newCartItem;
                });

        // Update the quantity for the product in the cart
        cartItem.setQuantity(cartItem.getQuantity() + quantity);
        cartItemRepository.save(cartItem);

        return convertToCartDTO(cart);
    }



    @Override
    public CartDTO getCartByShop(String shopId) {
        // Use the repository method that queries by the nested shop ID field.
        Cart cart = cartRepository.findByShop_Id(shopId);
        if (cart == null) {
            throw new RuntimeException("Cart not found for shop with id: " + shopId);
        }
        return convertToCartDTO(cart);
    }

    @Override
    public CartDTO removeProductFromCart(String cartId, String productId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found with id: " + cartId));

        CartItem cartItem = cartItemRepository.findByCart_IdAndProduct_ProductId(cartId, productId)
                .orElseThrow(() -> new RuntimeException("Product not found in the cart with id: " + productId));

        cartItemRepository.delete(cartItem);

        // Check if cart is now empty, you may choose to delete the cart
        if (cart.getItems().isEmpty()) {
            cartRepository.delete(cart);
        }

        return convertToCartDTO(cart);
    }

    @Override
    public CartDTO updateProductQuantity(String cartId, String productId, int quantity) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found with id: " + cartId));

        CartItem cartItem = cartItemRepository.findByCart_IdAndProduct_ProductId(cartId, productId)
                .orElseThrow(() -> new RuntimeException("Product not found in the cart with id: " + productId));

        if (quantity <= 0) {
            // Remove product if quantity is zero or less
            cartItemRepository.delete(cartItem);
        } else {
            // Update the quantity
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);
        }

        return convertToCartDTO(cart);
    }

    @Override
    public List<CartItemDTO> getAllCartItems(String cartId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found with id: " + cartId));

        return cart.getItems().stream()
                .map(this::convertToCartItemDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<CartItemDTO> getCartItemsByShopAndSupplier(String shopId, String supplierId) {
        Cart cart = cartRepository.findByShop_IdAndSupplier_Id(shopId, supplierId);
        
        if (cart == null) {
            throw new RuntimeException("No cart found for the given shop and supplier combination");
        }

        return cart.getItems().stream()
                .map(this::convertToCartItemDTO)
                .collect(Collectors.toList());
    }



    // Helper method to convert Cart entity to CartDTO
    private CartDTO convertToCartDTO(Cart cart) {
        return modelMapper.map(cart, CartDTO.class);
    }

    // Helper method to convert CartItem entity to CartItemDTO
    private CartItemDTO convertToCartItemDTO(CartItem cartItem) {
        return modelMapper.map(cartItem, CartItemDTO.class);
    }
}
