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
import com.sattva.model.Shop;
import com.sattva.model.SubCategory;
import com.sattva.model.Supplier;
import com.sattva.model.SupplierBusiness;
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

        // Get all pincodes from retailer's shops
        List<String> retailerPincodes = retailer.getShops().stream()
                .map(Shop::getPincode)
                .collect(Collectors.toList());

        List<String> categoryNames = request.getCategoryNames();
        String pincodeFilter = request.getPincodeFilter();
        Double ratingFilter = request.getRating();

        List<Supplier> suppliers;

        // Filter suppliers by category
        if (categoryNames != null && !categoryNames.isEmpty()) {
            List<String> categoryIds = categoryRepository.findByNameIn(categoryNames)
                    .stream()
                    .map(Category::getId)
                    .collect(Collectors.toList());

            suppliers = supplierRepository.findDistinctByCategories_IdIn(categoryIds);
        } else {
            suppliers = supplierRepository.findAll();
        }

        suppliers = suppliers.stream()
            .filter(supplier -> {
                // Get all business pincodes for this supplier
                List<String> supplierPincodes = supplier.getBusinesses().stream()
                        .map(SupplierBusiness::getPincode)
                        .collect(Collectors.toList());

                if ("myPincode".equalsIgnoreCase(pincodeFilter)) {
                    return supplierPincodes.stream().anyMatch(retailerPincodes::contains);
                } else if ("others".equalsIgnoreCase(pincodeFilter)) {
                    return supplierPincodes.stream().noneMatch(retailerPincodes::contains);
                }
                return true;
            })
            .filter(supplier -> {
                //Filter by rating
                if (ratingFilter != null) {
                    return supplier.getRating() != null && supplier.getRating() >= ratingFilter;
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
        //dto.setPincode(supplier.getUser().getPincode());
        String supplierPincodes = supplier.getBusinesses().stream()
        .filter(SupplierBusiness::isActive)
        .map(SupplierBusiness::getPincode)
        .distinct()
        .collect(Collectors.joining(", "));
        dto.setPincode(supplierPincodes);

        
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

        return dto;
    }
}
