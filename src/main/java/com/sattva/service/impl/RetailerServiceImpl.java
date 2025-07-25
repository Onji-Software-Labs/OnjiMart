package com.sattva.service.impl;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.netflix.discovery.converters.Auto;
import com.sattva.dto.SupplierDTO;
import com.sattva.dto.SupplierFilterRequest;
import com.sattva.model.Category;
import com.sattva.model.Retailer;
import com.sattva.model.SubCategory;
import com.sattva.model.Supplier;
import com.sattva.repository.CategoryRepository;
import com.sattva.repository.RetailerRepository;
import com.sattva.repository.SupplierRepository;
import com.sattva.service.RetailerService;

@Service
public class RetailerServiceImpl implements RetailerService {

    @Autowired
    private RetailerRepository retailerRepository;
    
    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public List<SupplierDTO> getSuppliersForRetailer(String retailerId) {
        Retailer retailer = retailerRepository.findById(retailerId)
                .orElseThrow(() -> new RuntimeException("Retailer not found with id: " + retailerId));

        // Fetch all suppliers (or apply filtering logic here)
        List<Supplier> suppliers = supplierRepository.findAll();

        // Convert to DTOs
        return suppliers.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<SupplierDTO> filterSuppliers(String retailerId, SupplierFilterRequest request) {
        Retailer retailer = retailerRepository.findById(retailerId)
                .orElseThrow(() -> new RuntimeException("Retailer not found"));

        String retailerPincode = retailer.getUser().getPincode();
        List<String> categoryNames = request.getCategoryNames();
        String pincodeFilter = request.getPincodeFilter();
        Double ratingFilter = request.getRating(); // new line

        List<Supplier> suppliers;

        //Filter by categories
        if (categoryNames != null && !categoryNames.isEmpty()) {
            List<String> categoryIds = categoryRepository.findByNameIn(categoryNames)
                                                        .stream()
                                                        .map(Category::getId)
                                                        .collect(Collectors.toList());
            System.out.println("\n\nCategory IDs: " + categoryIds + "\n\n");
            suppliers = supplierRepository.findDistinctByCategories_IdIn(categoryIds);
        } else {
            suppliers = supplierRepository.findAll();
        }

        suppliers = suppliers.stream()
            .filter(supplier -> {
                String supplierPincode = supplier.getUser().getPincode(); //Filter by pincode
                if ("myPincode".equalsIgnoreCase(pincodeFilter)) {
                    return retailerPincode.equals(supplierPincode);
                } else if ("others".equalsIgnoreCase(pincodeFilter)) {
                    return !retailerPincode.equals(supplierPincode);
                }
                return true;
            })
            .filter(supplier -> {
                if (ratingFilter != null) {
                    return supplier.getRating() != null && supplier.getRating() >= ratingFilter; ////Filter by rating
                }
                return true;
            })
            .collect(Collectors.toList());

        return suppliers.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private SupplierDTO convertToDTO(Supplier supplier) {
        SupplierDTO dto = new SupplierDTO();
        dto.setId(supplier.getId());
        dto.setFullName(supplier.getUser().getFullName());
        dto.setEmail(supplier.getUser().getEmail());
        dto.setRating(supplier.getRating());
        dto.setPincode(supplier.getUser().getPincode());
        
        dto.setCategoryIds(
            supplier.getCategories()
                    .stream()
                    .map(Category::getId)
                    .collect(Collectors.toList())
        );

        dto.setSubCategoryIds(
            supplier.getSubCategories()
                    .stream()
                    .map(SubCategory::getId)
                    .collect(Collectors.toList())
        );

        // Add more fields if needed (like categories, etc.)
        return dto;
    }
}
