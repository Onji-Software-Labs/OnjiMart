package com.sattva.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sattva.model.User;

public interface UserRepository extends JpaRepository<User, String> {
	 // Find user by username for authentication
    Optional<User> findByUsername(String username);

    // Check if a user exists by username (for registration to prevent duplicates)
    boolean existsByUsername(String username);

    // Check if a user exists by email (for registration to prevent duplicates)
    boolean existsByEmail(String email);
    
    Optional<User> findByPhoneNumber(String phoneNumber);
}
