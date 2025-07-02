package com.sattva.service;

import java.util.List;

import com.sattva.dto.SubCategoryDTO;

public interface SubCategoryService {
    List<SubCategoryDTO> getAllSubCategories();
    SubCategoryDTO getSubCategoryById(String subCategoryId);
    SubCategoryDTO createSubCategory(SubCategoryDTO subCategoryDTO);
    SubCategoryDTO updateSubCategory(String subCategoryId, SubCategoryDTO subCategoryDTO);
    void deleteSubCategory(String subCategoryId);
    
}