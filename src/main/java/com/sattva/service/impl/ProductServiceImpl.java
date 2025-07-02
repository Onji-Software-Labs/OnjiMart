package com.sattva.service.impl;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sattva.dto.ProductDTO;
import com.sattva.model.Category;
import com.sattva.model.Product;
import com.sattva.model.SubCategory;
import com.sattva.repository.CategoryRepository;
import com.sattva.repository.ProductRepository;
import com.sattva.repository.SubCategoryRepository;
import com.sattva.service.ProductService;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SubCategoryRepository subCategoryRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(product -> modelMapper.map(product, ProductDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public ProductDTO getProductById(String productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
        return modelMapper.map(product, ProductDTO.class);
    }

    @Override
    public ProductDTO createProduct(ProductDTO productDTO) {
        Category category = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + productDTO.getCategoryId()));

        SubCategory subCategory = null;
        if (productDTO.getSubCategoryId() != null) {
            subCategory = subCategoryRepository.findById(productDTO.getSubCategoryId())
                    .orElseThrow(() -> new RuntimeException("SubCategory not found with id: " + productDTO.getSubCategoryId()));
        }

        Product product = modelMapper.map(productDTO, Product.class);
        product.setProductId(UUID.randomUUID().toString());
        product.setCategory(category);
        product.setSubCategory(subCategory);

        Product savedProduct = productRepository.save(product);
        return modelMapper.map(savedProduct, ProductDTO.class);
    }

    @Override
    public ProductDTO updateProduct(String productId, ProductDTO productDTO) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        Category category = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + productDTO.getCategoryId()));

        SubCategory subCategory = null;
        if (productDTO.getSubCategoryId() != null) {
            subCategory = subCategoryRepository.findById(productDTO.getSubCategoryId())
                    .orElseThrow(() -> new RuntimeException("SubCategory not found with id: " + productDTO.getSubCategoryId()));
        }

        modelMapper.map(productDTO, product); // Update product fields with productDTO values

        product.setCategory(category);
        product.setSubCategory(subCategory);

        Product updatedProduct = productRepository.save(product);
        return modelMapper.map(updatedProduct, ProductDTO.class);
    }

    @Override
    public void deleteProduct(String productId) {
        productRepository.deleteById(productId);
    }
    @Override
    public List<ProductDTO> getProductsBySubcategoryId(String subCategoryId) {
        List<Product> products = productRepository.findBySubCategory_Id(subCategoryId);
        return products.stream()
                .map(product -> modelMapper.map(product, ProductDTO.class))
                .collect(Collectors.toList());
    }
}

