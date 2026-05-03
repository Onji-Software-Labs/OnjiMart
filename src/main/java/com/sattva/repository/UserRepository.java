package com.sattva.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.sattva.model.User;
import java.util.List;
import com.sattva.enums.UserType;
import com.sattva.model.User;

public interface UserRepository extends JpaRepository<User, String> {
	 // Find user by username for authentication
    Optional<User> findByUsername(String username);

    // Check if a user exists by username (for registration to prevent duplicates)
    boolean existsByUsername(String username);

    // Check if a user exists by email (for registration to prevent duplicates)
    boolean existsByEmail(String email);
    
    Optional<User> findByPhoneNumber(String phoneNumber);

    Optional<User> findByEmail(String email);
    List<User> findByUserType(UserType userType);

    @Query("SELECT u FROM User u WHERE u.userType = :userType AND u.id NOT IN :ids")
    List<User> findByUserTypeAndIdNotIn(@Param("userType") UserType userType, @Param("ids") List<String> ids);

}
