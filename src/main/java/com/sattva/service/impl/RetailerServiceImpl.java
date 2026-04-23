package com.sattva.service.impl;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import com.sattva.dto.*;
import com.sattva.enums.ConnectionStatus;
import com.sattva.model.*;
import com.sattva.repository.*;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sattva.exception.ResourceNotFoundException;
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

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ConnectionRepository connectionRepository;

    // 🔥 FIXED METHOD
    @Override
    public PaginatedResponseDTO<SupplierListDTO> getSuppliersForRetailer(String retailerId, int page, int size) {

        Retailer retailer = retailerRepository.findById(retailerId)
                .orElseThrow(() -> new ResourceNotFoundException("Retailer not found with id: " + retailerId));

        List<Connection> connections = connectionRepository
                .findByRetailerIdAndStatus(retailerId, ConnectionStatus.ACCEPTED);

        List<String> supplierIds = connections.stream()
                .map(Connection::getSupplierId)
                .distinct()
                .collect(Collectors.toList());

        if (supplierIds.isEmpty()) {
            PaginatedResponseDTO<SupplierListDTO> response = new PaginatedResponseDTO<>();
            response.setContent(List.of());
            response.setPage(page);
            response.setSize(size);
            response.setTotalElements(0);
            response.setTotalPages(0);
            response.setLast(true);
            return response;
        }

        List<Supplier> suppliers = supplierRepository.findByIdIn(supplierIds);

        List<SupplierListDTO> dtoList = suppliers.stream()
                .map(this::convertToListDTO)
                .collect(Collectors.toList());

        int start = Math.min(page * size, dtoList.size());
        int end = Math.min(start + size, dtoList.size());

        List<SupplierListDTO> paginatedList = dtoList.subList(start, end);

        PaginatedResponseDTO<SupplierListDTO> response = new PaginatedResponseDTO<>();
        response.setContent(paginatedList);
        response.setPage(page);
        response.setSize(size);
        response.setTotalElements(dtoList.size());
        response.setTotalPages((int) Math.ceil((double) dtoList.size() / size));
        response.setLast(end >= dtoList.size());

        return response;
    }

    // ✅ SINGLE METHOD (duplicate removed)
    private SupplierListDTO convertToListDTO(Supplier supplier) {

        String businessNames = supplier.getBusinesses().stream()
                .map(SupplierBusiness::getName)
                .filter(name -> name != null && !name.isEmpty())
                .distinct()
                .collect(Collectors.joining(", "));

        String cities = supplier.getBusinesses().stream()
                .map(SupplierBusiness::getCity)
                .filter(city -> city != null && !city.isEmpty())
                .distinct()
                .collect(Collectors.joining(", "));

        return new SupplierListDTO(
                supplier.getId(),
                supplier.getUser() != null ? supplier.getUser().getFullName() : null,
                businessNames,
                cities,
                supplier.getRating()
        );
    }

    @Override
    public List<SupplierDTO> filterSuppliers(String retailerId, SupplierFilterRequest request) {

        Retailer retailer = retailerRepository.findById(retailerId)
                .orElseThrow(() -> new ResourceNotFoundException("Retailer not found"));

        List<String> retailerPincodes = retailer.getShops().stream()
                .map(Shop::getPincode)
                .collect(Collectors.toList());

        List<String> categoryNames = request.getCategoryNames();
        String pincodeFilter = request.getPincodeFilter();
        Double ratingFilter = request.getRating();

        List<Supplier> suppliers;

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

        User user = userRepository.findById(dto.getRetailerId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Retailer retailer = retailerRepository.findById(dto.getRetailerId())
                .orElseGet(() -> retailerRepository.save(
                        Retailer.builder().user(user).build()
                ));

        RetailerBusiness business = RetailerBusiness.builder()
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

        Retailer savedRetailer = retailerRepository.save(retailer);
        return modelMapper.map(savedRetailer, RetailerDTO.class);
    }

    @Override
    public RetailerBusinessRequestDTO getBusinessDetails(String businessId) {
        RetailerBusiness business = retailerBusinessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));
        RetailerBusinessRequestDTO dto = modelMapper.map(business, RetailerBusinessRequestDTO.class);
        populateCategoryDetails(dto, business.getRetailer());
        return dto;
    }

    @Override
    public List<RetailerBusinessRequestDTO> getAllBusinesses() {
        return retailerBusinessRepository.findAll().stream()
                .map(b -> {
                    RetailerBusinessRequestDTO dto = modelMapper.map(b, RetailerBusinessRequestDTO.class);
                    populateCategoryDetails(dto, b.getRetailer());
                    return dto;
                }).collect(Collectors.toList());
    }

    @Override
    public List<RetailerBusinessRequestDTO> getBusinessesByPincode(String pincode) {
        return retailerBusinessRepository.findByPincode(pincode).stream()
                .map(b -> {
                    RetailerBusinessRequestDTO dto = modelMapper.map(b, RetailerBusinessRequestDTO.class);
                    populateCategoryDetails(dto, b.getRetailer());
                    return dto;
                }).collect(Collectors.toList());
    }

    @Override
    public RetailerDTO updateBusinessAndCategories(String businessId, RetailerBusinessRequestDTO dto) {
        RetailerBusiness business = retailerBusinessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));

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
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));

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
                        .orElseThrow(() -> new ResourceNotFoundException("Category not found")))
                .collect(Collectors.toSet());
        retailer.setCategories(categories);
    }

    private void populateCategoryDetails(RetailerBusinessRequestDTO dto, Retailer retailer) {
        dto.setCategoryIds(
                retailer.getCategories().stream()
                        .map(Category::getId)
                        .collect(Collectors.toList())
        );
    }
}