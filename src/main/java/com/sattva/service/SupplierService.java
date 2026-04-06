package com.sattva.service;

import java.util.List;

import com.sattva.dto.*;

public interface SupplierService {
    SupplierBusinessResponseDTO createBusinessAndAssignCategories(SupplierBusinessRequestDTO dto);
    SupplierDTO addCategoriesAndSubCategoriesToSupplier(String supplierId, List<String> categoryIds, List<String> subCategoryIds);
    public List<CategoryDTO> getCategoriesForSupplier(String supplierId);
    public List<SubCategoryDTO> getSubCategoriesForSupplierAndCategory(String supplierId, String categoryId);
    SupplierBusinessRequestDTO getBusinessDetails(String businessId);
    SupplierDTO updateBusinessAndCategories(String businessId, SupplierBusinessRequestDTO dto);
    void deleteBusinessAndCategories(String businessId);
    List<SupplierBusinessRequestDTO> getAllBusinesses();
    List<SupplierBusinessRequestDTO> getBusinessesByPincode(String pincode);
}