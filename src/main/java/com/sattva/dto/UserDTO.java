package com.sattva.dto;

import java.time.LocalDateTime;
import java.util.Set;

import com.sattva.enums.UserStatus;
import com.sattva.enums.UserType;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserDTO {

    private String id;                   
    private String username; 
    private String password;             // Consider removing or handling this separately
    private String phoneNumber;
    private Set<String> roles;           // Updated to handle multiple roles if needed
    private String email;                
    private UserStatus status;           
    private UserType userType;           
    private boolean active;              // Updated naming convention
    private LocalDateTime dateEntered;   
    private LocalDateTime dateModified;  
    private boolean onboardingStatus;    // Updated naming convention
    private String fullName;
}
