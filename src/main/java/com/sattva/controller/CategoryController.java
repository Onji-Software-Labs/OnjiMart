package com.sattva.controller;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.sattva.dto.CategoryDTO;
import com.sattva.service.CategoryService;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin
public class CategoryController {
	    @Autowired
	    private CategoryService categoryService;

	    // Get all categories
	    @GetMapping
	    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
	        List<CategoryDTO> categories = categoryService.getAllCategories();
	        return ResponseEntity.ok(categories);
	    }

	    // Get category by ID
	    @GetMapping("/{categoryId}")
	    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable String categoryId) {
	        CategoryDTO categoryDTO = categoryService.getCategoryById(categoryId);
	        return ResponseEntity.ok(categoryDTO);
	    }

	    // Create new category
	    @PostMapping("/create")
	    public ResponseEntity<CategoryDTO> createCategory(@RequestBody CategoryDTO categoryDTO) {
	        CategoryDTO createdCategory = categoryService.createCategory(categoryDTO);
	        return new ResponseEntity<>(createdCategory, HttpStatus.CREATED);
	    }

	    // Update existing category
	    @PutMapping("/{categoryId}")
	    public ResponseEntity<CategoryDTO> updateCategory(@PathVariable String categoryId, @RequestBody CategoryDTO categoryDTO) {
	        CategoryDTO updatedCategory = categoryService.updateCategory(categoryId, categoryDTO);
	        return ResponseEntity.ok(updatedCategory);
	    }

	    // Delete category by ID
	    @DeleteMapping("/{categoryId}")
	    public ResponseEntity<Void> deleteCategory(@PathVariable String categoryId) {
	        categoryService.deleteCategory(categoryId);
	        return ResponseEntity.noContent().build();
	    }
	    
	    

}