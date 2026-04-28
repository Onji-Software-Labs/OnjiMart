package com.sattva.service;

import java.util.List;

import com.sattva.dto.ProductDTO;

public interface ProductService {
    List<ProductDTO> getAllProducts();
    ProductDTO getProductById(String productId);
    ProductDTO createProduct(ProductDTO productDTO);
    ProductDTO updateProduct(String productId, ProductDTO productDTO);
    void deleteProduct(String productId);
    List<ProductDTO> getProductsBySubcategoryId(String subCategoryId);

    // Fetch products belonging to a specific supplier
    List<ProductDTO> getProductsBySupplier(String supplierId);

    // Map selected products to a supplier
    void mapProductsToSupplier(String supplierId, List<String> productIds);

    //Map all products of a category to a supplier
    // void mapProductsByCategory(String categoryId, String supplierId);
}