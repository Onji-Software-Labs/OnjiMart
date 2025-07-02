package com.sattva.service.impl;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sattva.dto.SubCategoryDTO;
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
                .orElseThrow(() -> new RuntimeException("SubCategory not found with id: " + subCategoryId));
        return modelMapper.map(subCategory, SubCategoryDTO.class);
    }

    @Override
    public SubCategoryDTO createSubCategory(SubCategoryDTO subCategoryDTO) {
        // Log incoming DTO
        System.out.println("Received SubCategoryDTO: " + subCategoryDTO);

        // Find category by ID
        Category category = categoryRepository.findById(subCategoryDTO.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + subCategoryDTO.getCategoryId()));

        // Convert DTO to entity
        SubCategory subCategory = modelMapper.map(subCategoryDTO, SubCategory.class);

        // Set additional properties manually
        subCategory.setCategory(category);
        subCategory.setId(UUID.randomUUID().toString());

        // Log the mapped entity
        System.out.println("Mapped SubCategory: " + subCategory);

        // Save subcategory
        SubCategory savedSubCategory = subCategoryRepository.save(subCategory);

        // Log saved entity
        System.out.println("Saved SubCategory: " + savedSubCategory);

        return modelMapper.map(savedSubCategory, SubCategoryDTO.class);
    }


    @Override
    public SubCategoryDTO updateSubCategory(String subCategoryId, SubCategoryDTO subCategoryDTO) {
        SubCategory subCategory = subCategoryRepository.findById(subCategoryId)
                .orElseThrow(() -> new RuntimeException("SubCategory not found with id: " + subCategoryId));

        Category category = categoryRepository.findById(subCategoryDTO.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + subCategoryDTO.getCategoryId()));

        modelMapper.map(subCategoryDTO, subCategory);
        subCategory.setCategory(category);

        SubCategory updatedSubCategory = subCategoryRepository.save(subCategory);
        return modelMapper.map(updatedSubCategory, SubCategoryDTO.class);
    }

    @Override
    public void deleteSubCategory(String subCategoryId) {
        subCategoryRepository.deleteById(subCategoryId);
    }
}