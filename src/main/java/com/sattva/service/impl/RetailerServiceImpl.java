package com.sattva.service.impl;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import com.sattva.dto.RetailerBusinessRequestDTO;
import com.sattva.dto.RetailerDTO;
import com.sattva.model.*;
import com.sattva.repository.*;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.netflix.discovery.converters.Auto;
import com.sattva.dto.SupplierDTO;
import com.sattva.dto.SupplierFilterRequest;
import com.sattva.service.RetailerService;

@Service
public class RetailerServiceImpl implements RetailerService {

    @Autowired
    private RetailerRepository retailerRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private RetailerBusinessRepository retailerBusinessRepository;

    @Autowired
    private ModelMapper modelMapper;

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
        return dto;
    }

    @Override
    public RetailerDTO createBusinessAndAssignCategories(RetailerBusinessRequestDTO dto) {
        Retailer retailer = retailerRepository.findById(dto.getRetailerId())
                .orElseThrow(() -> new RuntimeException("Retailer not found with id: " + dto.getRetailerId()));
        RetailerBusiness business = new RetailerBusiness().builder()
                .id(UUID.randomUUID().toString())
                .retailer(retailer)
                .name(dto.getName())
                .city(dto.getCity())
                .address(dto.getAddress())
                .pincode(dto.getPincode())
                .contactNumber(dto.getContactNumber())
                .isActive(true)
                .build();

        retailer.getRetailerBusinesses().add(business);

        if (dto.getCategoryIds() != null) {
            Set<Category> categories = dto.getCategoryIds().stream()
                    .map(id -> categoryRepository.findById(id)
                            .orElseThrow(() -> new RuntimeException("Category not found with id: " + id)))
                    .collect(Collectors.toSet());
            retailer.getCategories().addAll(categories);
        }

        Retailer savedRetailer = retailerRepository.save(retailer);
        return modelMapper.map(savedRetailer, RetailerDTO.class);
    }

    @Override
    public RetailerBusinessRequestDTO getBusinessDetails(String businessId) {
        RetailerBusiness business = retailerBusinessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Business not found with id: " + businessId));
        RetailerBusinessRequestDTO dto = modelMapper.map(business, RetailerBusinessRequestDTO.class);
        populateCategoryDetails(dto, business.getRetailer());
        return dto;

    }

    @Override
    public List<RetailerBusinessRequestDTO> getAllBusinesses() {
        return retailerBusinessRepository.findAll().stream()
                .map(business -> {
                    RetailerBusinessRequestDTO dto = modelMapper.map(business, RetailerBusinessRequestDTO.class);
                    populateCategoryDetails(dto, business.getRetailer());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<RetailerBusinessRequestDTO> getBusinessesByPincode(String pincode) {
        return retailerBusinessRepository.findByPincode(pincode).stream()
                .map(business -> {
                    RetailerBusinessRequestDTO dto = modelMapper.map(business, RetailerBusinessRequestDTO.class);
                    populateCategoryDetails(dto, business.getRetailer());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public RetailerDTO updateBusinessAndCategories(String businessId, RetailerBusinessRequestDTO dto) {
        RetailerBusiness business = retailerBusinessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Business not found with id: " + businessId));

        business.setName(dto.getName());
        business.setCity(dto.getCity());
        business.setAddress(dto.getAddress());
        business.setPincode(dto.getPincode());
        business.setContactNumber(dto.getContactNumber());

        Retailer retailer = business.getRetailer();
        updateRetalierCategories(retailer, dto.getCategoryIds());
        return modelMapper.map(retailerRepository.save(retailer), RetailerDTO.class);
    }

    @Override
    public void deleteBusinessAndCategories(String businessId) {
        RetailerBusiness business = retailerBusinessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Business not found with id: " + businessId));
        Retailer retailer = business.getRetailer();
        retailer.getRetailerBusinesses().remove(business);
        retailerBusinessRepository.delete(business);

        if (retailer.getRetailerBusinesses().isEmpty()) {
            retailer.getCategories().clear();
        }
        retailerRepository.save(retailer);
    }

    private void updateRetalierCategories(Retailer retailer, List<String> categoryIds) {
        Set<Category> categories = categoryIds.stream()
                .map(id -> categoryRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Category not found with id: " + id)))
                .collect(Collectors.toSet());
        retailer.setCategories(categories);
    }

    private void populateCategoryDetails(RetailerBusinessRequestDTO dto, Retailer retailer) {
        dto.setCategoryIds(
                retailer.getCategories()
                        .stream()
                        .map(Category::getId)
                        .collect(Collectors.toList())
        );
    }
}
