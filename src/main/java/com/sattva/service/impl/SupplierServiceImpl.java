package com.sattva.service.impl;
import org.springframework.stereotype.Service;

import com.sattva.dto.CategoryDTO;
import com.sattva.dto.SubCategoryDTO;
import com.sattva.dto.SupplierBusinessRequestDTO;
import com.sattva.dto.SupplierDTO;
import com.sattva.model.Category;
import com.sattva.model.SubCategory;
import com.sattva.model.Supplier;
import com.sattva.model.SupplierBusiness;
import com.sattva.repository.CategoryRepository;
import com.sattva.repository.SubCategoryRepository;
import com.sattva.repository.SupplierBusinessRepository;
import com.sattva.repository.SupplierRepository;
import com.sattva.service.SupplierService;

import org.springframework.beans.factory.annotation.Autowired;
import org.modelmapper.ModelMapper;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SupplierServiceImpl implements SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SubCategoryRepository subCategoryRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
        private SupplierBusinessRepository supplierBusinessRepository;


    @Override
        public SupplierDTO createBusinessAndAssignCategories(SupplierBusinessRequestDTO dto) {
        Supplier supplier = supplierRepository.findById(dto.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + dto.getSupplierId()));

        //Save business
        SupplierBusiness business = SupplierBusiness.builder()
                .id(UUID.randomUUID().toString())
                .supplier(supplier)
                .name(dto.getName())
                .address(dto.getAddress())
                .city(dto.getCity())
                .pincode(dto.getPincode())
                .contactNumber(dto.getContactNumber())
                .isActive(true)
                .build();

        supplier.getBusinesses().add(business); 

        //Assign categories
        if (dto.getCategoryIds() != null) {
                Set<Category> categories = dto.getCategoryIds().stream()
                        .map(id -> categoryRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Category not found: " + id)))
                        .collect(Collectors.toSet());
                supplier.getCategories().addAll(categories);
        }

        //Assign subcategories
        if (dto.getSubCategoryIds() != null) {
                Set<SubCategory> subCategories = dto.getSubCategoryIds().stream()
                        .map(id -> subCategoryRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("SubCategory not found: " + id)))
                        .collect(Collectors.toSet());
                supplier.getSubCategories().addAll(subCategories);
        }

        //Save supplier (which cascades and saves business too)
        Supplier savedSupplier = supplierRepository.save(supplier);

        return modelMapper.map(savedSupplier, SupplierDTO.class);
        }

        @Override
        public SupplierBusinessRequestDTO getBusinessDetails(String businessId) {
        SupplierBusiness business = supplierBusinessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Business not found with id: " + businessId));
        return modelMapper.map(business, SupplierBusinessRequestDTO.class);
        }

        @Override
        public SupplierDTO updateBusinessAndCategories(String businessId, SupplierBusinessRequestDTO dto) {
        SupplierBusiness business = supplierBusinessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Business not found"));

        business.setName(dto.getName());
        business.setAddress(dto.getAddress());
        business.setCity(dto.getCity());
        business.setPincode(dto.getPincode());
        business.setContactNumber(dto.getContactNumber());

        supplierBusinessRepository.save(business);

        Supplier supplier = business.getSupplier();
        updateSupplierCategoriesAndSubCategories(supplier, dto.getCategoryIds(), dto.getSubCategoryIds());

        return modelMapper.map(supplierRepository.save(supplier), SupplierDTO.class);
        }

        @Override
        public void deleteBusinessAndCategories(String businessId) {
        SupplierBusiness business = supplierBusinessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Business not found"));

        Supplier supplier = business.getSupplier();
        supplier.getBusinesses().remove(business); // Remove the business
        supplierBusinessRepository.delete(business); // Delete business

        // Optionally, clean categories/subcategories if no other businesses remain
        if (supplier.getBusinesses().isEmpty()) {
                supplier.getCategories().clear();
                supplier.getSubCategories().clear();
        }

        supplierRepository.save(supplier);
        }

    // Add categories and subcategories to a supplier
    @Override
    public SupplierDTO addCategoriesAndSubCategoriesToSupplier(String supplierId, List<String> categoryIds, List<String> subCategoryIds) {
        // Fetch the supplier by its ID
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + supplierId));

        // Add categories to the supplier
        Set<Category> categories = new HashSet<>();
        for (String categoryId : categoryIds) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));
            categories.add(category);
        }
        supplier.getCategories().addAll(categories);

        // Add subcategories to the supplier
        Set<SubCategory> subCategories = new HashSet<>();
        for (String subCategoryId : subCategoryIds) {
            SubCategory subCategory = subCategoryRepository.findById(subCategoryId)
                    .orElseThrow(() -> new RuntimeException("SubCategory not found with id: " + subCategoryId));
            subCategories.add(subCategory);
        }
        supplier.getSubCategories().addAll(subCategories);

        // Save the updated supplier
        Supplier savedSupplier = supplierRepository.save(supplier);

        // Map the saved supplier to SupplierDTO and return it
        return modelMapper.map(savedSupplier, SupplierDTO.class);
    }

    // Get list of subcategories for a supplier and a specific category
    @Override
    public List<SubCategoryDTO> getSubCategoriesForSupplierAndCategory(String supplierId, String categoryId) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + supplierId));

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));

        // Filter subcategories belonging to the given category and supplier
        return supplier.getSubCategories().stream()
                .filter(subCategory -> subCategory.getCategory().equals(category))
                .map(subCategory -> modelMapper.map(subCategory, SubCategoryDTO.class))
                .collect(Collectors.toList());
    }

    // Get list of categories for a supplier
    @Override
    public List<CategoryDTO> getCategoriesForSupplier(String supplierId) {
        // Fetch the supplier by its ID
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + supplierId));

        // Map the categories of the supplier to CategoryDTO and return the list
        return supplier.getCategories().stream()
                .map(category -> modelMapper.map(category, CategoryDTO.class))
                .collect(Collectors.toList());
    }	

    private void updateSupplierCategoriesAndSubCategories(Supplier supplier, List<String> categoryIds, List<String> subCategoryIds) {
        Set<Category> categories = categoryIds.stream()
                .map(id -> categoryRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Category not found: " + id)))
                .collect(Collectors.toSet());

        Set<SubCategory> subCategories = subCategoryIds.stream()
                .map(id -> subCategoryRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("SubCategory not found: " + id)))
                .collect(Collectors.toSet());

        supplier.setCategories(categories);
        supplier.setSubCategories(subCategories);
        }

}
