package com.sattva.service;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    String store(MultipartFile file, String entityType, String entityId);

    default void delete(String location) {
        // optional for later GCS cleanup
    }
}
