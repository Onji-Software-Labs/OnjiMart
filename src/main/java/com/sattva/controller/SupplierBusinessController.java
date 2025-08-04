package com.sattva.controller;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.sattva.dto.SupplierBusinessRequestDTO;
import com.sattva.dto.SupplierDTO;
import com.sattva.service.SupplierService;

@RestController
@RequestMapping("/api/supplier-business")
@RequiredArgsConstructor
public class SupplierBusinessController {

    private final SupplierService supplierService;

    @PostMapping("/create-full")
    @PreAuthorize("hasRole('ROLE_SUPPLIER')")
    public ResponseEntity<SupplierDTO> createBusinessWithCategories(
            @RequestBody SupplierBusinessRequestDTO dto) {

        SupplierDTO updatedSupplier = supplierService.createBusinessAndAssignCategories(dto);
        return new ResponseEntity<>(updatedSupplier, HttpStatus.CREATED);
    }

    @GetMapping("/{businessId}")
    @PreAuthorize("hasRole('ROLE_SUPPLIER')")
    public ResponseEntity<SupplierBusinessRequestDTO> getBusiness(@PathVariable String businessId) {
        SupplierBusinessRequestDTO business = supplierService.getBusinessDetails(businessId);
        return ResponseEntity.ok(business);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ROLE_SUPPLIER')")
    public ResponseEntity<List<SupplierBusinessRequestDTO>> getAllBusinesses() {
        List<SupplierBusinessRequestDTO> businesses = supplierService.getAllBusinesses();
        return ResponseEntity.ok(businesses);
    }

    @GetMapping("/by-pincode/{pincode}")
    @PreAuthorize("hasRole('ROLE_SUPPLIER')")
    public ResponseEntity<List<SupplierBusinessRequestDTO>> getBusinessesByPincode(@PathVariable String pincode) {
        List<SupplierBusinessRequestDTO> businesses = supplierService.getBusinessesByPincode(pincode);
        return ResponseEntity.ok(businesses);
    }

    @PutMapping("/{businessId}")
    @PreAuthorize("hasRole('ROLE_SUPPLIER')")
    public ResponseEntity<SupplierDTO> updateBusinessWithCategories(
            @PathVariable String businessId,
            @RequestBody SupplierBusinessRequestDTO dto) {
        SupplierDTO updatedSupplier = supplierService.updateBusinessAndCategories(businessId, dto);
        return ResponseEntity.ok(updatedSupplier);
    }

    @DeleteMapping("/{businessId}")
    @PreAuthorize("hasRole('ROLE_SUPPLIER')")
    public ResponseEntity<Void> deleteBusinessAndCategories(@PathVariable String businessId) {
        supplierService.deleteBusinessAndCategories(businessId);
        return ResponseEntity.noContent().build();
    }
}
