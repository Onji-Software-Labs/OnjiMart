package com.sattva.config;

import com.sattva.service.ProfilePhotoStorageService;
import com.sattva.service.impl.LocalProfilePhotoStorageServiceImpl;
import com.sattva.service.impl.S3ProfilePhotoStorageServiceImpl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class StorageConfig {

    @Value("${profile.photo.storage.type:local}")
    private String storageType;

    @Bean
    public ProfilePhotoStorageService profilePhotoStorageService(
            LocalProfilePhotoStorageServiceImpl localService,
            S3ProfilePhotoStorageServiceImpl s3Service) {
        if ("s3".equalsIgnoreCase(storageType)) {
            return s3Service;
        }
        return localService;

    }

}
