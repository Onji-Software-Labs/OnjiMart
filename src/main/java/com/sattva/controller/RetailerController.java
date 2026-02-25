package com.sattva.controller;

import java.util.List;

import com.sattva.dto.PaginatedResponseDTO;
import com.sattva.dto.SupplierListDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.netflix.discovery.converters.Auto;
import com.sattva.dto.SupplierFilterRequest;
import com.sattva.dto.SupplierDTO;
import com.sattva.service.RetailerService;

//Added newly
@CrossOrigin
@RestController
@RequestMapping("/retailers")

public class RetailerController {

    @Autowired
    private RetailerService retailerService;

    @GetMapping("/{retailerId}/suppliers")
    public ResponseEntity<PaginatedResponseDTO<SupplierListDTO>> getSuppliersForRetailer(@PathVariable String retailerId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        PaginatedResponseDTO<SupplierListDTO> suppliers = retailerService.getSuppliersForRetailer(retailerId, page, size);
        return ResponseEntity.ok(suppliers);
    }

    @PostMapping("/{retailerId}/suppliers/filterSuppliers")
    public ResponseEntity<List<SupplierDTO>> filterSuppliers(
            @PathVariable String retailerId,    
            @RequestBody SupplierFilterRequest filterRequest) {

        List<SupplierDTO> filteredSuppliers =
                retailerService.filterSuppliers(retailerId, filterRequest);

        return ResponseEntity.ok(filteredSuppliers);
    }

}