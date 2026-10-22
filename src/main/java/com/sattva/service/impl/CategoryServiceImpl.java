package com.sattva.service.impl;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sattva.dto.CategoryDTO;
import com.sattva.dto.SubCategoryDTO;
import com.sattva.exception.ResourceNotFoundException;
import com.sattva.model.Category;
import com.sattva.repository.CategoryRepository;
import com.sattva.service.CategoryService;

@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(category -> modelMapper.map(category, CategoryDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public CategoryDTO getCategoryById(String categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
        return modelMapper.map(category, CategoryDTO.class);
    }
    
    @Override
    public CategoryDTO createCategory(CategoryDTO categoryDTO) {

        String name = categoryDTO.getName();

        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Category name is required.");
        }

        name = name.trim();

        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new com.sattva.exception.ConflictException(
                    "Category already exists. You can add the existing category to your store."
            );
        }

        categoryDTO.setName(name);
        categoryDTO.setId(UUID.randomUUID().toString());

        Category category = modelMapper.map(categoryDTO, Category.class);
        Category savedCategory = categoryRepository.save(category);

        return modelMapper.map(savedCategory, CategoryDTO.class);
    }


    
        @Override
        public CategoryDTO updateCategory(String categoryId, CategoryDTO categoryDTO) {
            Category existingCategory = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Category not found with id: " + categoryId));

            String name = categoryDTO.getName();

            if (name == null || name.trim().isEmpty()) {
                throw new IllegalArgumentException("Category name is required.");
            }

            name = name.trim();

            List<Category> categoriesWithSameName =
        categoryRepository.findAllByNameIgnoreCase(name);

            boolean duplicateExists = categoriesWithSameName.stream()
                    .anyMatch(category -> !category.getId().equals(categoryId));

            if (duplicateExists) {
                throw new com.sattva.exception.ConflictException(
                        "Category already exists. Please use a different name.");
            }

            existingCategory.setName(name);
            existingCategory.setDescription(categoryDTO.getDescription());

            Category updatedCategory = categoryRepository.save(existingCategory);
            return modelMapper.map(updatedCategory, CategoryDTO.class);
        }


    @Override
    public void deleteCategory(String categoryId) {
        Category existingCategory = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
        categoryRepository.delete(existingCategory);
    }

    @Override
    public List<SubCategoryDTO> getSubcategoriesByCategoryId(String categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
        return category.getSubCategories()
                .stream()
                .map(subCategory -> modelMapper.map(subCategory, SubCategoryDTO.class))
                .collect(Collectors.toList());
    }
}