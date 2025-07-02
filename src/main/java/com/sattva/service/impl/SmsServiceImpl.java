package com.sattva.service.impl;


import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.otpless.authsdk.OTPAuth;
import com.otpless.authsdk.OTPResponse;
import com.sattva.dto.CreateUserDTO;
import com.sattva.dto.LoginRequest;
import com.sattva.dto.OTPLessResponse;
import com.sattva.enums.OtpStatus;
import com.sattva.service.SmsService;

@Service
public class SmsServiceImpl implements SmsService {


   private final String apiKey = "RLHVQ211M8B3USHZ5JB3";
    Map<String, Integer> otpMap = new HashMap<>();


    private int generateOtp() {
        // Generate a random number between 100000 (inclusive) and 999999 (inclusive)
        return new Random().nextInt(900000) + 100000;
    }

    @Override
    public boolean authenticateOtp(String phoneNumber, int otp) {

        boolean isOtpValid = otpMap.entrySet().stream()
                .filter(entry -> entry.getKey().equals(phoneNumber) && entry.getValue().equals(otp))
                .findFirst()
                .map(entry -> {
                    otpMap.remove(entry.getKey(), entry.getValue());
                    return true;
                })
                .orElse(false);

        return isOtpValid;
    }


	
	private final String clientId = "THRB3063H5L7XY7MAXR8S6YROKY7IQ4N";
    private final String clientSecret = "xf5ft4qzajj5ddie9zchzyk1vznqm6g2";
    @Override
    public OTPLessResponse sendOtp(CreateUserDTO userDto, boolean userExists, String userId, String userName, String fullName, boolean userOnboardingStatus) {
        
        OTPAuth otpAuth = new OTPAuth(clientId, clientSecret);

        try {
            
            String phoneNumber = userDto.getPhoneNumber();
            String orderId = generateOrderId();
            Integer expiredInSec = 60; 
            Integer otpLength = 6; 
            String channel = "SMS"; 
            
            OTPResponse otpResponse = otpAuth.sendOTP(orderId, phoneNumber, null, null, expiredInSec, otpLength, channel);

            // Check if the OTP was sent successfully
            if (otpResponse.isSuccess()) {
                // If OTP sending was successful, return the OTP details in the response DTO
                return new OTPLessResponse(OtpStatus.DELIVERED, "OTP sent successfully", userExists , otpResponse.getOrderId(), userId, userName, fullName, userOnboardingStatus);
            } else {
                // If OTP sending failed, handle it accordingly
                System.out.println("Failed to send OTP. Reason: " + otpResponse.getErrorMessage());
                return new OTPLessResponse(OtpStatus.FAILED, "Failed to send OTP", userExists, otpResponse.getOrderId(), userId, userName, fullName, userOnboardingStatus);
            }
        } catch (Exception e) {
            // Handle exceptions
            e.printStackTrace();
            // Return an appropriate response indicating failure
            return new OTPLessResponse(OtpStatus.FAILED, e.getMessage(), userExists, apiKey, userId, userName, fullName, userOnboardingStatus);
        }
    }
    private String generateOrderId() {
        // Example: Concatenate a timestamp with a random number
        return "DT" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 5);
    }

//	@Override
//	public OtpResponseDTO sendOtp(CreateUserDTO userDto, boolean existUser, String userId, String userName, String fullName, boolean userOnboardingStatus) {
//        // Generate a random OTP (for testing purposes)
//        int otp = new Random().nextInt(900000) + 100000; // Generate a 6-digit OTP
//        System.out.println("Generated OTP: " + otp); // Print the OTP to the console for testing
//
//        // Return a response with the generated OTP and other user details
//        return new OtpResponseDTO("OTP generated successfully", existUser, userId, userName, fullName, userOnboardingStatus, otp);
//    }

}