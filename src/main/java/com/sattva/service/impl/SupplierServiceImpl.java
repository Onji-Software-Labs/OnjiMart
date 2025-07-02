package com.sattva.service.impl;
import org.springframework.stereotype.Service;

import com.sattva.dto.CategoryDTO;
import com.sattva.dto.SubCategoryDTO;
import com.sattva.dto.SupplierDTO;
import com.sattva.model.Category;
import com.sattva.model.SubCategory;
import com.sattva.model.Supplier;
import com.sattva.repository.CategoryRepository;
import com.sattva.repository.SubCategoryRepository;
import com.sattva.repository.SupplierRepository;
import com.sattva.service.SupplierService;

import org.springframework.beans.factory.annotation.Autowired;
import org.modelmapper.ModelMapper;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SupplierServiceImpl implements SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SubCategoryRepository subCategoryRepository;

    @Autowired
    private ModelMapper modelMapper;

    // Add categories and subcategories to a supplier
    @Override
    public SupplierDTO addCategoriesAndSubCategoriesToSupplier(String supplierId, List<String> categoryIds, List<String> subCategoryIds) {
        // Fetch the supplier by its ID
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + supplierId));

        // Add categories to the supplier
        Set<Category> categories = new HashSet<>();
        for (String categoryId : categoryIds) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));
            categories.add(category);
        }
        supplier.getCategories().addAll(categories);

        // Add subcategories to the supplier
        Set<SubCategory> subCategories = new HashSet<>();
        for (String subCategoryId : subCategoryIds) {
            SubCategory subCategory = subCategoryRepository.findById(subCategoryId)
                    .orElseThrow(() -> new RuntimeException("SubCategory not found with id: " + subCategoryId));
            subCategories.add(subCategory);
        }
        supplier.getSubCategories().addAll(subCategories);

        // Save the updated supplier
        Supplier savedSupplier = supplierRepository.save(supplier);

        // Map the saved supplier to SupplierDTO and return it
        return modelMapper.map(savedSupplier, SupplierDTO.class);
    }

    // Get list of subcategories for a supplier and a specific category
    @Override
    public List<SubCategoryDTO> getSubCategoriesForSupplierAndCategory(String supplierId, String categoryId) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + supplierId));

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));

        // Filter subcategories belonging to the given category and supplier
        return supplier.getSubCategories().stream()
                .filter(subCategory -> subCategory.getCategory().equals(category))
                .map(subCategory -> modelMapper.map(subCategory, SubCategoryDTO.class))
                .collect(Collectors.toList());
    }

    // Get list of categories for a supplier
    @Override
    public List<CategoryDTO> getCategoriesForSupplier(String supplierId) {
        // Fetch the supplier by its ID
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + supplierId));

        // Map the categories of the supplier to CategoryDTO and return the list
        return supplier.getCategories().stream()
                .map(category -> modelMapper.map(category, CategoryDTO.class))
                .collect(Collectors.toList());
    }	
}
