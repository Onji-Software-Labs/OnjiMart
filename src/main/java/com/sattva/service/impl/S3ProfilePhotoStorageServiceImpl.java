package com.sattva.service.impl;

import com.sattva.service.ProfilePhotoStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.*;

import java.time.Duration;


@Service("s3ProfilePhotoStorageService")
public class S3ProfilePhotoStorageServiceImpl implements ProfilePhotoStorageService {

    @Value("${aws.s3.bucket}")
    private String bucketName;

    @Value("${aws.access-key}")
    private String accessKeyId;

    @Value("${aws.secret-access-key}")
    private String secretAccessKey;

    @Value("${aws.region}")
    private String region;

    private S3Client s3Client() {
        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKeyId, secretAccessKey)))
                .build();
    }

    private S3Presigner s3Presigner() {
        return S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKeyId, secretAccessKey)))
                .build();
    }

    @Override
    public String storeProfilePhoto(String userId, MultipartFile file) throws Exception {
        String key = "profile-photos/" + userId + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
        s3Client().putObject(PutObjectRequest.builder()
                .bucket(bucketName).key(key).build(), RequestBody.fromBytes(file.getBytes()));
        return key;

    }

    @Override
    public String generatePresignedUploadUrl(String userId, String fileName) {

        String key = "profile-photos/" + userId + "_" + System.currentTimeMillis() + "_" + fileName;
        PresignedPutObjectRequest presignedRequest = s3Presigner().presignPutObject(builder -> builder
                .signatureDuration(Duration.ofMinutes(15))
                .putObjectRequest(req -> req.bucket(bucketName).key(key)));
        return presignedRequest.url().toString();
    }

    @Override
    public String generatePresignedGetUrl(String key) {
        PresignedGetObjectRequest presignedGetRequest = s3Presigner().presignGetObject(
                GetObjectPresignRequest.builder()
                        .signatureDuration(Duration.ofMinutes(15))
                        .getObjectRequest(req -> req.bucket(bucketName).key(key))
                        .build()
        );
        return presignedGetRequest.url().toString();
    }
}
