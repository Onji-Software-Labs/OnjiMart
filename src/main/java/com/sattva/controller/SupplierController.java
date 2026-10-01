package com.sattva.controller;

import java.util.List;

import com.sattva.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.sattva.service.SupplierService;
@RestController
@RequestMapping("/suppliers")
@CrossOrigin    
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

    @GetMapping("/{supplierId}/retailers")
    public ResponseEntity<List<RetailerDTO>> getConnectedRetailers(@PathVariable String supplierId) {

        List<RetailerDTO> retailers = supplierService.getConnectedRetailers(supplierId);

        return ResponseEntity.ok(retailers);
    }

    // Endpoint to add rating to a supplier
    @PostMapping("/{supplierId}/rating/{rating}")
    public ResponseEntity<SupplierDTO> addRatingToSupplier(
            @PathVariable String supplierId,
            @PathVariable Double rating) {

        // Calling the service method to add rating to the supplier
        SupplierDTO updatedSupplier = supplierService.addRatingToSupplier(
                supplierId, rating);

        // Return the updated supplier as a response
        return ResponseEntity.ok(updatedSupplier);
    }

    @GetMapping("/{supplierId}/retailers/unconnected")
    public ResponseEntity<PaginatedResponseDTO<RetailerListDTO>> getUnconnectedRetailers(
            @PathVariable String supplierId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PaginatedResponseDTO<RetailerListDTO> retailers =
                supplierService.getUnconnectedRetailersForSupplier(supplierId, page, size);
        return ResponseEntity.ok(retailers);
    }
}
