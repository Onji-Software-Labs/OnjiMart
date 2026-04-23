package com.sattva.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sattva.dto.CartDTO;
import com.sattva.dto.CartItemDTO;
import com.sattva.exception.ResourceNotFoundException;
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
    private ModelMapper modelMapper;

    @Autowired
    private SupplierRepository supplierRepository;

    @Override
    public CartDTO addProductToCart(String shopId, String supplierId, String productId, int quantity) {

        // Fetch shop
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new ResourceNotFoundException("Shop not found with id: " + shopId));

        // Fetch supplier
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + supplierId));

        final Cart cart;

        // Get or create cart
        Cart existingCart = cartRepository.findByShop_IdAndSupplier_Id(shopId, supplierId);
        if (existingCart == null) {
            Cart newCart = new Cart();
            newCart.setShop(shop);
            newCart.setSupplier(supplier);
            cart = cartRepository.save(newCart);
        } else {
            cart = existingCart;
        }

        // Fetch product (FIXED)
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        // Find existing cart item
        CartItem cartItem = cartItemRepository
                .findByCart_IdAndProduct_ProductId(cart.getId(), productId)
                .orElse(null);

        // Add or update quantity (FIXED)
        if (cartItem == null) {
            cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setProduct(product);
            cartItem.setQuantity(quantity);
        } else {
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
        }

        cartItemRepository.save(cartItem);

        return convertToCartDTO(cart);
    }

    @Override
    public List<CartDTO> getCartByShop(String shopId) {

        List<Cart> carts = cartRepository.findByShop_Id(shopId);

        if (carts == null || carts.isEmpty()) {
            throw new ResourceNotFoundException("Cart not found for shop with id: " + shopId);
        }

        return carts.stream()
                .map(this::convertToCartDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CartDTO removeProductFromCart(String cartId, String productId) {

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found with id: " + cartId));

        CartItem cartItem = cartItemRepository
                .findByCart_IdAndProduct_ProductId(cartId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found in the cart"));

        cartItemRepository.delete(cartItem);

        // If cart is empty, delete cart
        if (cart.getItems().isEmpty()) {
            cartRepository.delete(cart);
        }

        return convertToCartDTO(cart);
    }

    @Override
    public CartDTO updateProductQuantity(String cartId, String productId, int quantity) {

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found with id: " + cartId));

        CartItem cartItem = cartItemRepository
                .findByCart_IdAndProduct_ProductId(cartId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found in cart"));

        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
        } else {
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);
        }

        return convertToCartDTO(cart);
    }

    @Override
    public List<CartItemDTO> getAllCartItems(String cartId) {

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found with id: " + cartId));

        return cart.getItems()
                .stream()
                .map(this::convertToCartItemDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CartItemDTO> getCartItemsByShopAndSupplier(String shopId, String supplierId) {

        Cart cart = cartRepository.findByShop_IdAndSupplier_Id(shopId, supplierId);

        if (cart == null) {
            throw new ResourceNotFoundException("No cart found for given shop and supplier");
        }

        return cart.getItems()
                .stream()
                .map(this::convertToCartItemDTO)
                .collect(Collectors.toList());
    }

        private CartDTO convertToCartDTO(Cart cart) {
            CartDTO dto = modelMapper.map(cart, CartDTO.class);

            if (cart.getItems() != null && !cart.getItems().isEmpty()) {
                List<CartItemDTO> items = cart.getItems()
                        .stream()
                        .map(this::convertToCartItemDTO)
                        .collect(Collectors.toList());

                dto.setItems(items);
            } else {
                dto.setItems(List.of()); // ✅ always return empty list
            }

            return dto;
        }

    // Convert CartItem → DTO
    private CartItemDTO convertToCartItemDTO(CartItem cartItem) {
        return modelMapper.map(cartItem, CartItemDTO.class);
    }
}