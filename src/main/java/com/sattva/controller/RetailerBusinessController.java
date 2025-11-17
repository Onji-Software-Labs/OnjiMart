package com.sattva.controller;

import com.sattva.dto.RetailerBusinessRequestDTO;
import com.sattva.dto.RetailerDTO;
import com.sattva.service.RetailerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/retailer-business")
@RequiredArgsConstructor
public class RetailerBusinessController {

    private final RetailerService retailerService;

    @PostMapping("/create")
    @PreAuthorize("hasRole('ROLE_RETAILER')")
    public ResponseEntity<RetailerDTO> createBusinessWithCategories(@RequestBody RetailerBusinessRequestDTO dto){
        return new ResponseEntity<>(retailerService.createBusinessAndAssignCategories(dto), HttpStatus.CREATED);
    }

    @GetMapping("/{businessId}")
    @PreAuthorize("hasRole('ROLE_RETAILER')")
    public ResponseEntity<RetailerBusinessRequestDTO> getBusiness(@PathVariable String businessId){
        return ResponseEntity.ok(retailerService.getBusinessDetails(businessId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<RetailerBusinessRequestDTO>> getAllBusinesses(){
        return ResponseEntity.ok(retailerService.getAllBusinesses());
    }

    @GetMapping("/by-pincode/{pincode}")
    public ResponseEntity<List<RetailerBusinessRequestDTO>> getBusinessesByPincode(@PathVariable String pincode){
        return ResponseEntity.ok(retailerService.getBusinessesByPincode(pincode));
    }

    @PutMapping("/{businessId}")
    @PreAuthorize("hasRole('ROLE_RETAILER')")
    public ResponseEntity<RetailerDTO> updateBusinessWithCategories(@PathVariable String businessId, @RequestBody RetailerBusinessRequestDTO dto){
        return ResponseEntity.ok(retailerService.updateBusinessAndCategories(businessId, dto));
    }

    @DeleteMapping("/{businessId}")
    @PreAuthorize("hasRole('ROLE_RETAILER')")
    public ResponseEntity<Void> deleteBusiness(@PathVariable String businessId){
        retailerService.deleteBusinessAndCategories(businessId);
        return ResponseEntity.noContent().build();
    }
}
