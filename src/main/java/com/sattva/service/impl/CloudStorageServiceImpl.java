package com.sattva.service.impl;

import com.sattva.service.StorageService;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@Profile("gcs")
public class CloudStorageServiceImpl implements StorageService {

    @Override
    public String store(MultipartFile file, String entityType, String entityId) {
        throw new UnsupportedOperationException("GCS storage has not been implemented yet");
    }
}
