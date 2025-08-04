package com.sattva.service;

import java.util.List;

import com.sattva.dto.CategoryDTO;
import com.sattva.dto.SubCategoryDTO;
import com.sattva.dto.SupplierBusinessRequestDTO;
import com.sattva.dto.SupplierDTO;

public interface SupplierService {
    SupplierDTO createBusinessAndAssignCategories(SupplierBusinessRequestDTO dto);
    SupplierDTO addCategoriesAndSubCategoriesToSupplier(String supplierId, List<String> categoryIds, List<String> subCategoryIds);
    public List<CategoryDTO> getCategoriesForSupplier(String supplierId);
    public List<SubCategoryDTO> getSubCategoriesForSupplierAndCategory(String supplierId, String categoryId);
    SupplierBusinessRequestDTO getBusinessDetails(String businessId);
    SupplierDTO updateBusinessAndCategories(String businessId, SupplierBusinessRequestDTO dto);
    void deleteBusinessAndCategories(String businessId);
}