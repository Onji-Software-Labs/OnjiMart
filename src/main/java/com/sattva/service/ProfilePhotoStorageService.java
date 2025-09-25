package com.sattva.service;

import org.springframework.web.multipart.MultipartFile;

public interface ProfilePhotoStorageService {

    // Returns the URL of the stored profile photo
    String storeProfilePhoto(String userId, MultipartFile file) throws Exception;

    // Generates a pre-signed URL for uploading a profile photo to s3
    String generatePresignedUploadUrl(String userId, String fileName);

    // Generates a pre-signed URL for retrieving a profile photo from s3
    String generatePresignedGetUrl(String key);

}
