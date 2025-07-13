package com.sattva.service.impl;

import com.sattva.dto.CreateUserDTO;
import com.sattva.dto.UserDTO;
import com.sattva.enums.RoleName;
import com.sattva.enums.UserStatus;
import com.sattva.model.RefreshToken;
import com.sattva.model.Retailer;
import com.sattva.model.Role;
import com.sattva.model.Supplier;
import com.sattva.model.User;
import com.sattva.repository.RefreshTokenRepository;
import com.sattva.repository.RoleRepository;
import com.sattva.repository.UserRepository;
import com.sattva.service.UserService;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RefreshTokenRepository refreshTokenRepository;
    
    @Autowired
    RoleRepository roleRepository;
    
    @Override
    public CreateUserDTO createUser(CreateUserDTO userDto) {
        User user;
        if (userDto.isSupplier()) {
            user = new Supplier();
        } else {
            user = new Retailer();
        }

        user.setId(UUID.randomUUID().toString());
        user.setUsername(userDto.getUserNames());
        user.setFullName(userDto.getFullName());
        user.setPhoneNumber(userDto.getPhoneNumber());
        user.setEmail(userDto.getEmail());
        user.setUserOnboardingStatus(false);

        // Save the user entity to the database
        User savedUser = userRepository.save(user);

        // Convert the saved User entity back to a DTO
        CreateUserDTO responseDto = new CreateUserDTO();
        responseDto.setId(savedUser.getId());
        responseDto.setUserNames(savedUser.getUsername());
        responseDto.setFullName(savedUser.getFullName());
        responseDto.setPhoneNumber(savedUser.getPhoneNumber());
        responseDto.setEmail(savedUser.getEmail());
        responseDto.setUserOnboardingStatus(savedUser.isUserOnboardingStatus());

        return responseDto;
    }


    @Override
    public UserDTO getUserById(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return mapToDTO(user);
    }

    @Override
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public UserDTO updateUser(String userId, UserDTO userDTO) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Update basic user fields
        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());
        user.setUserType(userDTO.getUserType());
        user.setStatus(userDTO.getStatus());

        // Update roles if provided
        if (userDTO.getRoles() != null && !userDTO.getRoles().isEmpty()) {
            Set<Role> updatedRoles = new HashSet<>();

            for (String roleNameStr : userDTO.getRoles()) {
                try {
                    // Assuming RoleName is an Enum representing role names
                    RoleName roleNameEnum = RoleName.valueOf(roleNameStr);
                    
                    // Find the Role by name using the RoleName enum
                    Role role = roleRepository.findByName(roleNameEnum)
                        .orElseThrow(() -> new RuntimeException("Role not found: " + roleNameStr));
                    
                    updatedRoles.add(role);
                } catch (IllegalArgumentException e) {
                    throw new RuntimeException("Invalid role name provided: " + roleNameStr);
                }
            }

            user.setRoles(updatedRoles);
        }

        User updatedUser = userRepository.save(user);
        return mapToDTO(updatedUser);
    }
    @Override
    public void deleteUser(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        userRepository.delete(user);
    }

    // Helper method to map User to UserDTO
    private UserDTO mapToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setUserType(user.getUserType());
        dto.setStatus(user.getStatus());
        return dto;
    }



	@Override
	@Transactional
    public boolean logoutUser(String refreshToken) {
        Optional<RefreshToken> existingToken = refreshTokenRepository.findByToken(refreshToken);
        if (existingToken.isPresent()) {
            refreshTokenRepository.delete(existingToken.get());
            return true;
        }
        return false;
    }



    }
