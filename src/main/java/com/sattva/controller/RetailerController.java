package com.sattva.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.netflix.discovery.converters.Auto;
import com.sattva.dto.SupplierFilterRequest;
import com.sattva.dto.SupplierDTO;
import com.sattva.service.RetailerService;

@RestController
@RequestMapping("/retailers")
public class RetailerController {

    @Autowired
    private RetailerService retailerService;

    @GetMapping("/{retailerId}/suppliers")
    public ResponseEntity<List<SupplierDTO>> getSuppliersForRetailer(@PathVariable String retailerId) {
        List<SupplierDTO> suppliers = retailerService.getSuppliersForRetailer(retailerId);
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