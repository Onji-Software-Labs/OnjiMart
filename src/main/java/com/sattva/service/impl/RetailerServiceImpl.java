package com.sattva.service.impl;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import com.sattva.dto.*;
import com.sattva.enums.ConnectionStatus;
import com.sattva.enums.UserType;
import com.sattva.model.*;
import com.sattva.repository.*;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sattva.exception.ConflictException;
import com.sattva.exception.ResourceNotFoundException;
import com.sattva.service.RetailerService;
import com.sattva.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
    private UserService userService;

    @Autowired
    private ConnectionRepository connectionRepository;

    @Override
    public PaginatedResponseDTO<SupplierListDTO> getSuppliersForRetailer(String retailerId, int page, int size) {

        Retailer retailer = retailerRepository.findById(retailerId)
                .orElseThrow(() -> new ResourceNotFoundException("Retailer not found with id: " + retailerId));

        // ✅ fetch only ACCEPTED connections
        List<Connection> connections =
                connectionRepository.findByRetailerIdAndStatus(retailerId, ConnectionStatus.ACCEPTED);

        List<String> supplierIds = connections.stream()
                .map(Connection::getSupplierId)
                .collect(Collectors.toList());

        List<Supplier> suppliers = supplierRepository.findAllById(supplierIds);

        // ✅ manual pagination
        int start = page * size;
        int end = Math.min(start + size, suppliers.size());

        List<Supplier> paginatedSuppliers =
                (start >= suppliers.size()) ? List.of() : suppliers.subList(start, end);

        PaginatedResponseDTO<SupplierListDTO> response = new PaginatedResponseDTO<>();

        response.setContent(
                paginatedSuppliers.stream()
                        .map(this::convertToListDTO)
                        .collect(Collectors.toList())
        );

        response.setPage(page);
        response.setSize(size);
        response.setTotalElements(suppliers.size());
        response.setTotalPages((int) Math.ceil((double) suppliers.size() / size));
        response.setLast(end >= suppliers.size());

        return response;
    }

    private SupplierListDTO convertToListDTO(Supplier supplier) {
        String businessNames = supplier.getBusinesses().stream()
                .map(SupplierBusiness::getName)
                .collect(Collectors.joining(", "));

        String cities = supplier.getBusinesses().stream()
                .map(SupplierBusiness::getCity)
                .filter(city -> city != null && !city.isEmpty())
                .distinct()
                .collect(Collectors.joining(", "));

        return new SupplierListDTO(
                supplier.getId(),
                supplier.getUser().getFullName(),
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

                // Fetch accepted connections for this retailer
                List<Connection> acceptedConnections =
                        connectionRepository.findByRetailerIdAndStatus(
                                retailerId,
                                ConnectionStatus.ACCEPTED
                        );

                // Extract connected supplier IDs
                List<String> connectedSupplierIds = acceptedConnections.stream()
                        .map(Connection::getSupplierId)
                        .collect(Collectors.toList());

                // Remove already connected suppliers
                suppliers = suppliers.stream()
                        .filter(supplier -> !connectedSupplierIds.contains(supplier.getId()))
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
        
        if (supplierRepository.existsById(user.getId())) {
                throw new ConflictException(
                        "User is already registered as a supplier and cannot become a retailer."
                );
        }

        Retailer retailer = retailerRepository.findById(dto.getRetailerId())
                .orElseGet(() -> retailerRepository.save(
                        Retailer.builder()
                                .user(user)
                                .build()
                ));

        if (user.getUserType() != null && user.getUserType() != UserType.RETAILER) {
        throw new ConflictException("User type cannot be changed.");
        }

        user.setUserType(UserType.RETAILER);

        user.setUserType(UserType.valueOf(dto.getUserType().toUpperCase()));
        user.setUserOnboardingStatus(true);
        userRepository.save(user);

        if (retailer.getRetailerBusinesses() != null && !retailer.getRetailerBusinesses().isEmpty()) {

            RetailerBusiness existingBusiness = retailer.getRetailerBusinesses().get(0);

            return RetailerDTO.builder()
                    .id(retailer.getId())
                    .businessName(existingBusiness.getName())
                    .address(existingBusiness.getAddress())
                    .city(existingBusiness.getCity())
                    .pincode(existingBusiness.getPincode())
                    .contactNumber(existingBusiness.getContactNumber())
                    .profilePicture(existingBusiness.getProfilePicture())  // ← ADD THIS
                    .build();
        }

        RetailerBusiness business = RetailerBusiness.builder()
                .id(UUID.randomUUID().toString())
                .retailer(retailer)
                .name(dto.getName())
                .city(dto.getCity())
                .address(dto.getAddress())
                .pincode(dto.getPincode())
                .contactNumber(dto.getContactNumber())
                .profilePicture(dto.getProfilePicture())  // ← ADD THIS
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
                .map(business -> {
                    RetailerBusinessRequestDTO dto = modelMapper.map(business, RetailerBusinessRequestDTO.class);
                    dto.setBusinessId(business.getId());
                    dto.setRetailerId(business.getRetailer().getId());
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
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));

        business.setName(dto.getName());
        business.setCity(dto.getCity());
        business.setAddress(dto.getAddress());
        business.setPincode(dto.getPincode());
        business.setContactNumber(dto.getContactNumber());
        business.setProfilePicture(dto.getProfilePicture());  // ← ADD THIS

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
                retailer.getCategories()
                        .stream()
                        .map(Category::getId)
                        .collect(Collectors.toList())
        );
    }
    @Override
    public PaginatedResponseDTO<SupplierListDTO> getUnconnectedSuppliersForRetailer(
            String retailerId, int page, int size) {

        Retailer retailer = retailerRepository.findById(retailerId)
                .orElseThrow(() -> new ResourceNotFoundException("Retailer not found with id: " + retailerId));

        // ✅ get IDs of suppliers this retailer is already connected with (ACCEPTED)
        List<Connection> connections =
                connectionRepository.findByRetailerIdAndStatus(retailerId, ConnectionStatus.ACCEPTED);

        List<String> connectedSupplierIds = connections.stream()
                .map(Connection::getSupplierId)
                .collect(Collectors.toList());

        // ✅ get every supplier, then filter out the ones already connected
        List<Supplier> unconnectedSuppliers = supplierRepository.findAll().stream()
                .filter(supplier -> !connectedSupplierIds.contains(supplier.getId()))
                .collect(Collectors.toList());

        // ✅ manual pagination, same as getSuppliersForRetailer
        int start = page * size;
        int end = Math.min(start + size, unconnectedSuppliers.size());

        List<Supplier> paginatedSuppliers =
                (start >= unconnectedSuppliers.size()) ? List.of() : unconnectedSuppliers.subList(start, end);

        PaginatedResponseDTO<SupplierListDTO> response = new PaginatedResponseDTO<>();

        response.setContent(
                paginatedSuppliers.stream()
                        .map(this::convertToListDTO)   // ✅ reuse the real existing mapper
                        .collect(Collectors.toList())
        );

        response.setPage(page);
        response.setSize(size);
        response.setTotalElements(unconnectedSuppliers.size());
        response.setTotalPages((int) Math.ceil((double) unconnectedSuppliers.size() / size));
        response.setLast(end >= unconnectedSuppliers.size());

        return response;
    }
}