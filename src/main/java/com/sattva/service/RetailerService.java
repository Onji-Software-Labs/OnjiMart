package com.sattva.service;

import java.util.List;

import com.sattva.dto.*;

public interface RetailerService {
    PaginatedResponseDTO<SupplierListDTO> getSuppliersForRetailer(String retailerId,int page, int size);
    List<SupplierDTO> filterSuppliers(String retailerId, SupplierFilterRequest request);
    RetailerDTO createBusinessAndAssignCategories(RetailerBusinessRequestDTO dto);
    RetailerBusinessRequestDTO getBusinessDetails(String businessId);
    List<RetailerBusinessRequestDTO> getAllBusinesses();
    List<RetailerBusinessRequestDTO> getBusinessesByPincode(String pincode);
    RetailerDTO updateBusinessAndCategories(String businessId, RetailerBusinessRequestDTO dto);
    void deleteBusinessAndCategories(String businessId);
}
