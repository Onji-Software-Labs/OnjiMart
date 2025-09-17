package com.sattva.service.impl;

import com.sattva.dto.CreateUserDTO;
import com.sattva.dto.UserDTO;
import com.sattva.enums.RoleName;
import com.sattva.enums.UserStatus;
import com.sattva.enums.UserType;
import com.sattva.model.RefreshToken;
import com.sattva.model.Retailer;
import com.sattva.model.Role;
import com.sattva.model.Supplier;
import com.sattva.model.User;
import com.sattva.repository.RefreshTokenRepository;
import com.sattva.repository.RetailerRepository;
import com.sattva.repository.RoleRepository;
import com.sattva.repository.SupplierRepository;
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

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private RetailerRepository retailerRepository;
    
    @Override
    public CreateUserDTO createUser(CreateUserDTO userDto) {
        User user = new User();
        user.setId(UUID.randomUUID().toString());
        if (userDto.getPhoneNumber() != null) {
            user.setPhoneNumber(userDto.getPhoneNumber());
        }

        if (userDto.getEmail() != null) {
            user.setEmail(userDto.getEmail());
        }

        // Save to DB
        User savedUser = userRepository.save(user);

        CreateUserDTO responseDto = new CreateUserDTO();
        responseDto.setId(savedUser.getId());
        responseDto.setPhoneNumber(savedUser.getPhoneNumber());
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
    @Transactional
    public UserDTO updateUser(String userId, UserDTO userDTO) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        user.setUsername(userDTO.getUsername());
        if (userDTO.getEmail() != null) {
            user.setEmail(userDTO.getEmail());
        }
        if (userDTO.getPhoneNumber() != null) {
            user.setPhoneNumber(userDTO.getPhoneNumber());
        }
        user.setPassword(userDTO.getPassword());
        user.setUserType(userDTO.getUserType());
        user.setStatus(userDTO.getStatus());
        user.setUserOnboardingStatus(userDTO.isOnboardingStatus());

        if (userDTO.getRoles() != null && !userDTO.getRoles().isEmpty()) {
            Set<Role> updatedRoles = new HashSet<>();
            for (String roleNameStr : userDTO.getRoles()) {
                try {
                    RoleName roleNameEnum = RoleName.valueOf(roleNameStr);
                    Role role = roleRepository.findByName(roleNameEnum)
                        .orElseThrow(() -> new RuntimeException("Role not found: " + roleNameStr));
                    updatedRoles.add(role);
                } catch (IllegalArgumentException e) {
                    throw new RuntimeException("Invalid role name provided: " + roleNameStr);
                }
            }
            user.setRoles(updatedRoles);
        }

        // Save updated user
        User updatedUser = userRepository.save(user);

        if (userDTO.getUserType() == UserType.SUPPLIER) {
            if (!supplierRepository.existsById(userId)) {
                Supplier supplier = new Supplier();
                supplier.setUser(user);  // set the actual user object
                supplierRepository.save(supplier);
            }
            retailerRepository.deleteById(userId);
        } else if (userDTO.getUserType() == UserType.RETAILER) {
            if (!retailerRepository.existsById(userId)) {
                Retailer retailer = new Retailer();
                retailer.setUser(user);  // set the actual user object
                retailerRepository.save(retailer);
            }
            supplierRepository.deleteById(userId);
        }

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
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setUserType(user.getUserType());
        dto.setStatus(user.getStatus());
        return dto;
    }



	@Override
	@Transactional
    public boolean logoutUser(String userId) {
        Optional<RefreshToken> existingToken = refreshTokenRepository.findByUserId(userId);
        if (existingToken.isPresent()) {
            refreshTokenRepository.delete(existingToken.get());
            return true;
        }
        return false;
    }



    }
