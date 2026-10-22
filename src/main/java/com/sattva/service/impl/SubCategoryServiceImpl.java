package com.sattva.service.impl;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Locale;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sattva.dto.SubCategoryDTO;
import com.sattva.exception.ResourceNotFoundException;
import com.sattva.model.Category;
import com.sattva.model.SubCategory;
import com.sattva.repository.CategoryRepository;
import com.sattva.repository.SubCategoryRepository;
import com.sattva.service.SubCategoryService;


@Service
public class SubCategoryServiceImpl implements SubCategoryService {

    @Autowired
    private SubCategoryRepository subCategoryRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public List<SubCategoryDTO> getAllSubCategories() {
        return subCategoryRepository.findAll().stream()
                .map(subCategory -> modelMapper.map(subCategory, SubCategoryDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public SubCategoryDTO getSubCategoryById(String subCategoryId) {
        SubCategory subCategory = subCategoryRepository.findById(subCategoryId)
                .orElseThrow(() -> new ResourceNotFoundException("SubCategory not found with id: " + subCategoryId));
        return modelMapper.map(subCategory, SubCategoryDTO.class);
    }

    
        private void validateDuplicateSubCategory(
                String name,
                String categoryId,
                String currentSubCategoryId) {

            if (name == null || name.trim().isEmpty()) {
                throw new IllegalArgumentException("Subcategory name is required.");
            }

            String normalizedName = name.trim().toLowerCase(Locale.ROOT);

            boolean duplicate = subCategoryRepository
                    .findByCategory_Id(categoryId)
                    .stream()
                    .anyMatch(sub -> normalizedName.equals(
                            sub.getName() == null
                                    ? ""
                                    : sub.getName().trim().toLowerCase(Locale.ROOT))
                            && !java.util.Objects.equals(
                            sub.getId(), currentSubCategoryId));

            if (duplicate) {
                throw new IllegalArgumentException(
                        "A subcategory with this name already exists in this category.");
            }
        }


    @Override
    public SubCategoryDTO createSubCategory(SubCategoryDTO subCategoryDTO) {

        // Find category by ID
        Category category = categoryRepository.findById(subCategoryDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + subCategoryDTO.getCategoryId()));

        validateDuplicateSubCategory(
                subCategoryDTO.getName(),
                subCategoryDTO.getCategoryId(),
                null
        );

        // Convert DTO to entity
        SubCategory subCategory = modelMapper.map(subCategoryDTO, SubCategory.class);

        // Set additional properties manually
        subCategory.setCategory(category);
        subCategory.setId(UUID.randomUUID().toString());


        // Save subcategory
        SubCategory savedSubCategory = subCategoryRepository.save(subCategory);


        return modelMapper.map(savedSubCategory, SubCategoryDTO.class);
    }



    @Override
    public SubCategoryDTO updateSubCategory(
            String subCategoryId,
            SubCategoryDTO subCategoryDTO) {

        SubCategory subCategory = subCategoryRepository.findById(subCategoryId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "SubCategory not found with id: " + subCategoryId));

        if (subCategoryDTO.getCategoryId() == null
                || subCategoryDTO.getCategoryId().trim().isEmpty()) {
            throw new IllegalArgumentException("Category ID is required.");
        }

        Category category = categoryRepository.findById(
                subCategoryDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: "
                                + subCategoryDTO.getCategoryId()));

        validateDuplicateSubCategory(
                subCategoryDTO.getName(),
                category.getId(),
                subCategoryId);

        // Update scalar fields explicitly.
        subCategory.setName(subCategoryDTO.getName().trim());
        subCategory.setDescription(subCategoryDTO.getDescription());

        // Update the relationship explicitly; do not map categoryId
        // onto the entity using ModelMapper.
        subCategory.setCategory(category);

        SubCategory updatedSubCategory =
                subCategoryRepository.save(subCategory);

        return modelMapper.map(updatedSubCategory, SubCategoryDTO.class);
    }

    @Override
    public void deleteSubCategory(String subCategoryId) {
        if (!subCategoryRepository.existsById(subCategoryId)) {
            throw new ResourceNotFoundException(
                    "SubCategory not found with id: " + subCategoryId);
        }

        subCategoryRepository.deleteById(subCategoryId);
    }
}