package com.sattva.service.impl;

import com.sattva.service.ProfilePhotoStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service("localProfilePhotoStorageService")
public class LocalProfilePhotoStorageServiceImpl implements ProfilePhotoStorageService {


    @Value("${profile.photo.local.storage.path}")
    private String storagePath;

    @Override
    public String storeProfilePhoto(String userId, MultipartFile file) throws Exception {
        String extension = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf("."));
        String fileName = userId + "_" + System.currentTimeMillis() + extension;
        Path dir = Paths.get(storagePath).toAbsolutePath().normalize();
        if(!Files.exists(dir)){
            Files.createDirectories(dir);
        }
        Path filePath = dir.resolve(fileName);
        file.transferTo(filePath.toFile());
        return fileName;
    }

    @Override
    public String generatePresignedUploadUrl(String userId, String fileName) {
        throw new UnsupportedOperationException("Presigned URL generation is not supported for local storage.");
    }

    @Override
    public String generatePresignedGetUrl(String key) {
        throw new UnsupportedOperationException(
                "Presigned GET URL generation is not supported for local storage."
        );
    }

}
