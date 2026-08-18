package com.sattva.controller;

import com.sattva.repository.RetailerRepository;
import com.sattva.repository.SupplierRepository;
import com.sattva.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin
@RequiredArgsConstructor
public class ProfilePictureController {

    private final StorageService storageService;
    private final SupplierRepository supplierRepository;
    private final RetailerRepository retailerRepository;

    @PostMapping(value = "/{entityType}/{id}/profile-picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadProfilePicture(
            @PathVariable String entityType,
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) {
        System.out.println("========== UPLOAD REQUEST RECEIVED ==========");
        System.out.println("Entity Type: " + entityType);
        System.out.println("ID: " + id);

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No file uploaded"));
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Only image files are supported"));
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(Map.of("message", "File size must be less than 5MB"));
        }

        if (!"supplier".equalsIgnoreCase(entityType) && !"retailer".equalsIgnoreCase(entityType)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Unsupported entity type"));
        }

        String profilePictureUrl = storageService.store(file, entityType, id);

        if ("supplier".equalsIgnoreCase(entityType)) {
            supplierRepository.findById(id).ifPresent(supplier -> {
                supplier.getBusinesses().forEach(business -> {
                    business.setProfilePicture(profilePictureUrl);
                });
                supplierRepository.save(supplier);
            });
        } else {
            retailerRepository.findById(id).ifPresent(retailer -> {
                retailer.getRetailerBusinesses().forEach(business -> {
                    business.setProfilePicture(profilePictureUrl);
                });
                retailerRepository.save(retailer);
            });
        }

        Map<String, String> response = new HashMap<>();
        response.put("profilePictureUrl", profilePictureUrl);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}
