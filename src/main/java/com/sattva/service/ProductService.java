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
}