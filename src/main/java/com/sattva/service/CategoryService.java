package com.sattva.service;

import java.util.List;

import com.sattva.dto.CategoryDTO;
import com.sattva.dto.SubCategoryDTO;

public interface CategoryService {

    // Get all categories
    List<CategoryDTO> getAllCategories();

    // Get category by ID
    CategoryDTO getCategoryById(String categoryId);

    // Create new category
    CategoryDTO createCategory(CategoryDTO categoryDTO);

    // Update existing category
    CategoryDTO updateCategory(String categoryId, CategoryDTO categoryDTO);

    // Delete category by ID
    void deleteCategory(String categoryId);
    
    List<SubCategoryDTO> getSubcategoriesByCategoryId(String categoryId);
}