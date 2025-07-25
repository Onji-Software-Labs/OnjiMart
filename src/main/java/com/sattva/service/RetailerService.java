package com.sattva.service;

import java.util.List;

import com.sattva.dto.SupplierDTO;
import com.sattva.dto.SupplierFilterRequest;

public interface RetailerService {
    List<SupplierDTO> getSuppliersForRetailer(String retailerId);
    List<SupplierDTO> filterSuppliers(String retailerId, SupplierFilterRequest request);
}
