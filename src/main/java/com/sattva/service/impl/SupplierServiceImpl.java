package com.sattva.service.impl;
import com.sattva.dto.*;
import com.sattva.model.*;
import com.sattva.repository.*;
import org.springframework.stereotype.Service;

import com.sattva.exception.ResourceNotFoundException;
import com.sattva.service.SupplierService;

import org.springframework.beans.factory.annotation.Autowired;
import org.modelmapper.ModelMapper;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import com.sattva.service.UserService;

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

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Override
        public SupplierBusinessResponseDTO createBusinessAndAssignCategories(SupplierBusinessRequestDTO dto) {
//        Supplier supplier = supplierRepository.findById(dto.getSupplierId())
//                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + dto.getSupplierId()));
//
        User user = userRepository.findById(dto.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // 2. Get or create Supplier
        Supplier supplier = supplierRepository.findById(dto.getSupplierId())
                .orElseGet(() -> supplierRepository.save(
                        Supplier.builder()
                                .user(user)
                                .build()
                ));
        //  ADD HERE (IMPORTANT)
        if (supplier.getBusinesses() != null && !supplier.getBusinesses().isEmpty()) {

            SupplierBusiness existingBusiness = supplier.getBusinesses().get(0);


            return SupplierBusinessResponseDTO.builder()
                    .BusinessName(existingBusiness.getName())
                    .address(existingBusiness.getAddress())
                    .city(existingBusiness.getCity())
                    .pincode(existingBusiness.getPincode())
                    .contactNumber(existingBusiness.getContactNumber())
                    .isActive(existingBusiness.isActive())
                    .supplierId(supplier.getId())
                    .categoryIds(
                            supplier.getCategories().stream()
                                    .map(Category::getId)
                                    .collect(Collectors.toSet())
                    )
                    .subCategoryIds(
                            supplier.getSubCategories().stream()
                                    .map(SubCategory::getId)
                                    .collect(Collectors.toSet())
                    )
                    .build();
        }
        // Save business
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
                System.out.println(dto.getCategoryIds());
                Set<Category> categories = dto.getCategoryIds().stream()
                        .map(id -> categoryRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id)))
                        .collect(Collectors.toSet());
                supplier.getCategories().addAll(categories);
        }

        //Assign subcategories
        if (dto.getSubCategoryIds() != null) {
            System.out.println(dto.getSubCategoryIds());
                Set<SubCategory> subCategories = dto.getSubCategoryIds().stream()
                        .map(id -> subCategoryRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("SubCategory not found: " + id)))
                        .collect(Collectors.toSet());
                supplier.getSubCategories().addAll(subCategories);
        }

        //Save supplier (which cascades and saves business too)
        Supplier savedSupplier = supplierRepository.save(supplier);

        //  clean and correct
        userService.updateOnboardingStatus(supplier.getUser().getId());

        // Capture final IDs for response
        Set<String> savedCategoryIds = savedSupplier.getCategories()
                .stream().map(Category::getId).collect(Collectors.toSet());

        Set<String> savedSubCategoryIds = savedSupplier.getSubCategories()
                .stream().map(SubCategory::getId).collect(Collectors.toSet());

        // Build and return response
        return SupplierBusinessResponseDTO.builder()
                .BusinessName(business.getName())
                .address(business.getAddress())
                .city(business.getCity())
                .pincode(business.getPincode())
                .contactNumber(business.getContactNumber())
                .isActive(business.isActive())
                .supplierId(savedSupplier.getId())
                .categoryIds(savedCategoryIds)        // ← included in response
                .subCategoryIds(savedSubCategoryIds)  // ← included in response
                .build();
    }

        @Override
        public SupplierBusinessRequestDTO getBusinessDetails(String businessId) {
        SupplierBusiness business = supplierBusinessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + businessId));

        SupplierBusinessRequestDTO dto = modelMapper.map(business, SupplierBusinessRequestDTO.class);

        populateCategoryDetails(dto, business.getSupplier());

        return dto;
        }

        @Override
        public List<SupplierBusinessRequestDTO> getAllBusinesses() {
        List<SupplierBusiness> businesses = supplierBusinessRepository.findAll();

        return businesses.stream()
                .map(business -> {
                        SupplierBusinessRequestDTO dto = modelMapper.map(business, SupplierBusinessRequestDTO.class);
                        populateCategoryDetails(dto, business.getSupplier());
                        dto.setBusinessId(business.getId());
                        return dto;
                })
                .collect(Collectors.toList());
        }

        @Override
        public List<SupplierBusinessRequestDTO> getBusinessesByPincode(String pincode) {
        List<SupplierBusiness> businesses = supplierBusinessRepository.findByPincode(pincode);

        return businesses.stream()
                .map(business -> {
                        SupplierBusinessRequestDTO dto = modelMapper.map(business, SupplierBusinessRequestDTO.class);
                        populateCategoryDetails(dto, business.getSupplier());

                        return dto;
                })
                .collect(Collectors.toList());
        }


        @Override
        public SupplierDTO updateBusinessAndCategories(String businessId, SupplierBusinessRequestDTO dto) {
        SupplierBusiness business = supplierBusinessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));

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
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));

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
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + supplierId));

        // Add categories to the supplier
        Set<Category> categories = new HashSet<>();
        for (String categoryId : categoryIds) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
            categories.add(category);
        }
        supplier.getCategories().addAll(categories);

        // Add subcategories to the supplier
        Set<SubCategory> subCategories = new HashSet<>();
        for (String subCategoryId : subCategoryIds) {
            SubCategory subCategory = subCategoryRepository.findById(subCategoryId)
                    .orElseThrow(() -> new ResourceNotFoundException("SubCategory not found with id: " + subCategoryId));
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
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + supplierId));

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

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
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + supplierId));

        // Map the categories of the supplier to CategoryDTO and return the list
        return supplier.getCategories().stream()
                .map(category -> modelMapper.map(category, CategoryDTO.class))
                .collect(Collectors.toList());
    }	

    private void updateSupplierCategoriesAndSubCategories(Supplier supplier, List<String> categoryIds, List<String> subCategoryIds) {
        Set<Category> categories = categoryIds.stream()
                .map(id -> categoryRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id)))
                .collect(Collectors.toSet());

        Set<SubCategory> subCategories = subCategoryIds.stream()
                .map(id -> subCategoryRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("SubCategory not found: " + id)))
                .collect(Collectors.toSet());

        supplier.setCategories(categories);
        supplier.setSubCategories(subCategories);
        }

        private void populateCategoryDetails(SupplierBusinessRequestDTO dto, Supplier supplier) {
                List<String> categoryIds = supplier.getCategories().stream()
                        .map(Category::getId)
                        .collect(Collectors.toList());

                List<String> subCategoryIds = supplier.getSubCategories().stream()
                        .map(SubCategory::getId)
                        .collect(Collectors.toList());

                dto.setCategoryIds(categoryIds);
                dto.setSubCategoryIds(subCategoryIds);
                }


}
