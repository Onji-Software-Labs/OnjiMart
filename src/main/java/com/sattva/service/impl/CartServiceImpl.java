package com.sattva.service.impl;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

import com.sattva.enums.DeliveryTimeSlot;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    @Transactional
    public CartDTO addProductToCart(String shopId, String supplierId, String productId, int quantity) {

        // Fetch shop
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new ResourceNotFoundException("Shop not found with id: " + shopId));

        // Fetch supplier
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + supplierId));

        // Get or create cart
        Cart cart = cartRepository.findByShop_IdAndSupplier_Id(shopId, supplierId)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setShop(shop);
                    newCart.setSupplier(supplier);
                    return cartRepository.save(newCart);
                });

        if (cart.getItems() == null) {
            cart.setItems(new HashSet<>());
        }

        // Fetch product
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        // Find existing cart item
        CartItem cartItem = cartItemRepository
                .findByCart_IdAndProduct_ProductId(cart.getId(), productId)
                .orElse(null);

        // Add or update quantity
        if (cartItem == null) {
            cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setProduct(product);
            cartItem.setQuantity(quantity);
            cartItem = cartItemRepository.save(cartItem);
            cart.getItems().add(cartItem); // keep the in-memory collection in sync
        } else {
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
            cartItemRepository.save(cartItem);
        }

        return convertToCartDTO(cart);
    }
    @Override
    public List<CartDTO> getCartByShop(String shopId) {

        List<Cart> carts = cartRepository.findByShop_Id(shopId);

        if (carts == null || carts.isEmpty()) {
            return List.of();
        }

        return carts.stream()
                .map(this::convertToCartDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CartDTO removeProductFromCart(String cartId, String productId) {

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found with id: " + cartId));

        CartItem cartItem = cartItemRepository
                .findByCart_IdAndProduct_ProductId(cartId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found in the cart"));

        cartItemRepository.delete(cartItem);

        if (cart.getItems() != null) {
            cart.getItems().remove(cartItem); // keep the in-memory collection in sync
        }

        // If cart is empty, delete cart
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            cartRepository.delete(cart);
        }

        return convertToCartDTO(cart);
    }

    @Override
    @Transactional
    public CartDTO updateProductQuantity(String cartId, String productId, int quantity) {

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found with id: " + cartId));

        CartItem cartItem = cartItemRepository
                .findByCart_IdAndProduct_ProductId(cartId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found in cart"));

        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
            if (cart.getItems() != null) {
                cart.getItems().remove(cartItem); // keep the in-memory collection in sync
            }
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

        if (cart.getItems() == null) {
            return List.of();
        }

        return cart.getItems()
                .stream()
                .map(this::convertToCartItemDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CartItemDTO> getCartItemsByShopAndSupplier(String shopId, String supplierId) {
        return cartRepository.findByShop_IdAndSupplier_Id(shopId, supplierId)
                .map(cart -> cart.getItems() == null
                        ? List.<CartItemDTO>of()
                        : cart.getItems().stream()
                        .map(item -> {
                            CartItemDTO dto = convertToCartItemDTO(item);
                            dto.setCartId(cart.getId());
                            return dto;
                        })
                        .collect(Collectors.toList()))
                .orElse(List.of());
    }

    // Convert Cart → DTO
    private CartDTO convertToCartDTO(Cart cart) {
        CartDTO dto = modelMapper.map(cart, CartDTO.class);

        if (cart.getItems() != null && !cart.getItems().isEmpty()) {
            List<CartItemDTO> items = cart.getItems()
                    .stream()
                    .map(this::convertToCartItemDTO)
                    .collect(Collectors.toList());

            dto.setItems(items);
        } else {
            dto.setItems(List.of()); // always return an empty list
        }

        return dto;
    }

    // Convert CartItem → DTO
    private CartItemDTO convertToCartItemDTO(CartItem cartItem) {
        return modelMapper.map(cartItem, CartItemDTO.class);
    }

    @Override
    @Transactional
    public CartDTO updateDeliveryInfo(String cartId, LocalDate deliveryDate, DeliveryTimeSlot slot) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found with id: " + cartId));

        cart.setDeliveryDate(deliveryDate);
        cart.setDeliveryTimeSlot(slot);

        return convertToCartDTO(cartRepository.save(cart));
    }

}