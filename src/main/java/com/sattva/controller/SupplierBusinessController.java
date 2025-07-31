package com.sattva.controller;

import lombok.RequiredArgsConstructor;

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
}
