package com.sattva.service;

import com.sattva.dto.CreateUserDTO;
import com.sattva.dto.LoginRequest;
import com.sattva.dto.LoginResponse;
import com.sattva.dto.OTPLessResponse;
import com.sattva.dto.OtpResponseDTO;
import com.sattva.dto.UserDTO;

public interface SmsService {

	 public boolean validateOtp(String phoneNumber, int enteredOtp);
	 public OTPLessResponse sendOtp(CreateUserDTO userDto, boolean userExists, String userId, String userName, String fullName, boolean userOnboardingStatus);
	 public boolean validatePhoneNumberAndOtpLess(String orderId, int otp, String phoneNumber);
	 public String generateToken(String phoneNumber, String userId);
	 
	
}