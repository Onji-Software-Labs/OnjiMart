package com.sattva.dto;

import java.time.LocalDate;
import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@NoArgsConstructor
@Getter
@Setter
@AllArgsConstructor
@Builder
public class CreateUserDTO {
	private String id;
    private String userNames;
    private String fullName;
    private String phoneNumber;
    private String email;
    private String userType; 
    private boolean UserOnboardingStatus;
    private boolean isSupplier;
}
