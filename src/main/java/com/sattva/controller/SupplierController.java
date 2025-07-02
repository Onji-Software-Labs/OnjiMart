package com.sattva.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sattva.dto.CategoryDTO;
import com.sattva.dto.SubCategoryDTO;
import com.sattva.dto.SupplierCategoriesSubCategoriesRequest;
import com.sattva.dto.SupplierDTO;
import com.sattva.service.SupplierService;
@RestController
@RequestMapping("/suppliers")
public class SupplierController {

    @Autowired
    private SupplierService supplierService;

    // Endpoint to add categories and subcategories to a supplier
    @PostMapping("/{supplierId}/categories-subcategories")
    public ResponseEntity<SupplierDTO> addCategoriesAndSubCategoriesToSupplier(
            @PathVariable String supplierId,
            @RequestBody SupplierCategoriesSubCategoriesRequest request) {

        // Calling the service method to add categories and subcategories to the supplier
        SupplierDTO updatedSupplier = supplierService.addCategoriesAndSubCategoriesToSupplier(
                supplierId, request.getCategoryIds(), request.getSubCategoryIds());

        // Return the updated supplier as a response
        return ResponseEntity.ok(updatedSupplier);
    }

    // Endpoint to get a list of subcategories for a supplier based on supplierId and categoryId
    @GetMapping("/{supplierId}/categories/{categoryId}/subcategories")
    public ResponseEntity<List<SubCategoryDTO>> getSubCategoriesForSupplierAndCategory(
            @PathVariable String supplierId,
            @PathVariable String categoryId) {

        // Fetching subcategories for the specified supplier and category
        List<SubCategoryDTO> subCategories = supplierService.getSubCategoriesForSupplierAndCategory(supplierId, categoryId);
        return ResponseEntity.ok(subCategories);
    }

    // Endpoint to get a list of categories for a supplier
    @GetMapping("/{supplierId}/categories")
    public ResponseEntity<List<CategoryDTO>> getCategoriesForSupplier(@PathVariable String supplierId) {

        // Fetching categories for the specified supplier
        List<CategoryDTO> categories = supplierService.getCategoriesForSupplier(supplierId);
        return ResponseEntity.ok(categories);
    }
}
