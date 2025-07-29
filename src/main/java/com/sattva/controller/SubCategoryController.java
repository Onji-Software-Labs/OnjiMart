package com.sattva.controller;

import com.sattva.dto.SubCategoryDTO;
import com.sattva.service.SubCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subcategories")
@CrossOrigin
public class SubCategoryController {

    @Autowired
    private SubCategoryService subCategoryService;

    @PostMapping
    public ResponseEntity<SubCategoryDTO> createSubCategory(@RequestBody SubCategoryDTO subCategoryDTO) {
        SubCategoryDTO createdSubCategory = subCategoryService.createSubCategory(subCategoryDTO);
        return new ResponseEntity<>(createdSubCategory, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<SubCategoryDTO>> getAllSubCategories() {
        List<SubCategoryDTO> subCategories = subCategoryService.getAllSubCategories();
        return ResponseEntity.ok(subCategories);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubCategoryDTO> getSubCategoryById(@PathVariable String id) {
        SubCategoryDTO subCategory = subCategoryService.getSubCategoryById(id);
        return ResponseEntity.ok(subCategory);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubCategoryDTO> updateSubCategory(@PathVariable String id, @RequestBody SubCategoryDTO subCategoryDTO) {
        SubCategoryDTO updatedSubCategory = subCategoryService.updateSubCategory(id, subCategoryDTO);
        return ResponseEntity.ok(updatedSubCategory);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubCategory(@PathVariable String id) {
        subCategoryService.deleteSubCategory(id);
        return ResponseEntity.noContent().build();
    }
}
