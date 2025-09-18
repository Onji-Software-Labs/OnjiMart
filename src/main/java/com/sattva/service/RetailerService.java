package com.sattva.service;

import java.util.List;

import com.sattva.dto.RetailerBusinessRequestDTO;
import com.sattva.dto.RetailerDTO;
import com.sattva.dto.SupplierDTO;
import com.sattva.dto.SupplierFilterRequest;

public interface RetailerService {
    List<SupplierDTO> getSuppliersForRetailer(String retailerId);
    List<SupplierDTO> filterSuppliers(String retailerId, SupplierFilterRequest request);
    RetailerDTO createBusinessAndAssignCategories(RetailerBusinessRequestDTO dto);
    RetailerBusinessRequestDTO getBusinessDetails(String businessId);
    List<RetailerBusinessRequestDTO> getAllBusinesses();
    List<RetailerBusinessRequestDTO> getBusinessesByPincode(String pincode);
    RetailerDTO updateBusinessAndCategories(String businessId, RetailerBusinessRequestDTO dto);
    void deleteBusinessAndCategories(String businessId);
}
