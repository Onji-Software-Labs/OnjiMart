package com.sattva.controller;

import com.sattva.dto.UserDTO;
import com.sattva.service.ProfilePhotoStorageService;
import com.sattva.service.UserService;
import com.sattva.service.impl.S3ProfilePhotoStorageServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private ProfilePhotoStorageService profilePhotoStorageService;

   @Value("${aws.s3.bucket}")
    private String bucketName;

    @Value("${aws.region}")
    private String region;


    // Create a new user dead endpoint
//    @PostMapping("/create")
//    public ResponseEntity<UserDTO> createUser(@RequestBody UserDTO userDTO) {
//        UserDTO createdUser = userService.createUser(userDTO);
//        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
//    }

    // Get a user by ID
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable String id) {
        UserDTO user = userService.getUserById(id);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    // Get all users
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    // Update a user by ID
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable String id, @RequestBody UserDTO userDTO) {
        UserDTO updatedUser = userService.updateUser(id, userDTO);
        return new ResponseEntity<>(updatedUser, HttpStatus.OK);
    }

    // Delete a user by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // Upload profile photo
    @PostMapping("/{id}/profile-photo")
    public ResponseEntity<?> uploadProfilePhoto(@PathVariable String id, @RequestParam("file")MultipartFile file) {
        try{
            String key = profilePhotoStorageService.storeProfilePhoto(id, file);

            String photoUrl;
            try{
                // Generate presigned URL for s3
                photoUrl = profilePhotoStorageService.generatePresignedGetUrl(key);
            } catch(UnsupportedOperationException e) {
                // Return the key for local storage
                photoUrl = key;
            }
            userService.updateProfilePhoto(id, photoUrl);
            return ResponseEntity.ok().body(Map.of("profilePhotoUrl", photoUrl));
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload photo: " + e.getMessage());
        }
    }

    // Generate presigned URL for profile photo upload
    @GetMapping("/{id}/profile-photo-presigned-url")
    public ResponseEntity<?> getPresignedUrl(@PathVariable String id, @RequestParam("fileName") String fileName) {
        try{
            String presignedUrl = profilePhotoStorageService.generatePresignedUploadUrl(id, fileName);
            return ResponseEntity.ok().body(Map.of("presignedUrl", presignedUrl));
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to generate presigned URL: " + e.getMessage());
        }
    }

    // Save S3 profile photo URL to user profile
    @PostMapping("/{id}/profile-photo-url")
    public ResponseEntity<?> saveS3ProfilePhotoUrl(@PathVariable String id, @RequestParam("photoUrl") String photoUrl) {
            userService.updateProfilePhoto(id,photoUrl);
            return ResponseEntity.ok().body(photoUrl);
    }
}
