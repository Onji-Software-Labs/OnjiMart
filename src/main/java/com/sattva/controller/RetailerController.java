package com.sattva.controller;

import java.util.List;

import com.sattva.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

//import com.netflix.discovery.converters.Auto;
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
        System.out.println("+++++++++++++++++++++++++++++++++" + suppliers);

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

    @GetMapping("/{retailerId}/suppliers/unconnected")
    public ResponseEntity<PaginatedResponseDTO<SupplierListDTO>> getUnconnectedSuppliers(
            @PathVariable String retailerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PaginatedResponseDTO<SupplierListDTO> suppliers =
                retailerService.getUnconnectedSuppliersForRetailer(retailerId, page, size);
        return ResponseEntity.ok(suppliers);
    }

    @GetMapping("/{retailerId}/{shopId}/discoverSuppliers")
    public ResponseEntity<List<DiscoverSupplierDTO>> getSuppliersByLocation (
            @PathVariable String retailerId,
            @PathVariable String shopId) {
        List<DiscoverSupplierDTO> suppliers =
                retailerService.getSuppliersByLocation(retailerId, shopId);
        return ResponseEntity.ok(suppliers);
    }

}