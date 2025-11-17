package com.sattva.service.impl;


import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.otpless.authsdk.OTPAuth;
import com.otpless.authsdk.OTPResponse;
import com.sattva.dto.CreateUserDTO;
import com.sattva.dto.LoginRequest;
import com.sattva.dto.OTPLessResponse;
import com.sattva.enums.OtpStatus;
import com.sattva.service.SmsService;
import com.sattva.security.JwtHelper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import java.util.List;


@Service
public class SmsServiceImpl implements SmsService {

    @Value("${wati.api.url}")
    private String watiApiUrl;

    @Value("${wati.api.token}")
    private String watiApiToken;

    @Value("${wati.template.name}")
    private String watiTemplateName;
    
	@Autowired
	JwtHelper jwtHelper;

    private final Map<String, Integer> otpMap = new ConcurrentHashMap<>();


   private final String apiKey = "RLHVQ211M8B3USHZ5JB3";
    // Map<String, Integer> otpMap = new HashMap<>();

    // @Override
    // public boolean authenticateOtp(String phoneNumber, int otp) {

    //     boolean isOtpValid = otpMap.entrySet().stream()
    //             .filter(entry -> entry.getKey().equals(phoneNumber) && entry.getValue().equals(otp))
    //             .findFirst()
    //             .map(entry -> {
    //                 otpMap.remove(entry.getKey(), entry.getValue());
    //                 return true;
    //             })
    //             .orElse(false);

    //     return isOtpValid;
    // }


	
	private final String clientId = "THRB3063H5L7XY7MAXR8S6YROKY7IQ4N";
    private final String clientSecret = "xf5ft4qzajj5ddie9zchzyk1vznqm6g2";
    
    @Override
    public OTPLessResponse sendOtp(CreateUserDTO userDto, boolean userExists, String userId, String userName, String fullName, boolean userOnboardingStatus) {
        String phoneNumber = userDto.getPhoneNumber();
        String otp = generateOtp(); // implement this method to generate a 6-digit OTP
        otpMap.put(phoneNumber, Integer.valueOf(otp));

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json-patch+json");
        headers.set("Authorization", "Bearer " + watiApiToken);

        // Build the Wati API URL with the whatsappNumber query parameter
        String url = watiApiUrl + "?whatsappNumber=" + phoneNumber;


        Map<String, Object> request = new HashMap<>();
        request.put("template_name", watiTemplateName);
        request.put("broadcast_name", "welcome_wati_v2"); // optional, can be used to group messages

        List<Map<String, String>> parameters = new ArrayList<>();
        Map<String, String> param = new HashMap<>();
        param.put("name", "name"); // must match your template variable
        param.put("value", otp);
        parameters.add(param);
        request.put("parameters", parameters);


        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                return new OTPLessResponse(OtpStatus.DELIVERED, "OTP sent via WhatsApp", userExists, otp, userId, userName, fullName, userOnboardingStatus);
            } else {
                return new OTPLessResponse(OtpStatus.FAILED, "Failed to send OTP via WhatsApp", userExists, otp, userId, userName, fullName, userOnboardingStatus);
            }
        } catch (Exception e) {
            return new OTPLessResponse(OtpStatus.FAILED, "Error: " + e.getMessage(), userExists, otp, userId, userName, fullName, userOnboardingStatus);
        }
    }


    private String generateOtp() {
        int otp = 100000 + new Random().nextInt(900000);
        return String.valueOf(otp);
    }


    public boolean validateOtp(String phoneNumber, int enteredOtp) {
        Integer storedOtp = otpMap.get(phoneNumber);
        if (storedOtp != null && storedOtp == enteredOtp) {
            otpMap.remove(phoneNumber); // clear after successful validation
            return true;
        }
        return false;
    }


    @Override
    public boolean validatePhoneNumberAndOtpLess(String orderId, int otp, String phoneNumber) {
        // You can ignore orderId or log it for auditing
        return validateOtp(phoneNumber, otp);
    }


    @Override
    public String generateToken(String phoneNumber, String userId, String type) {
        // Generate the token
        return jwtHelper.generateToken(phoneNumber, userId, "phoneNumber");
    }




    private String generateOrderId() {
        // Example: Concatenate a timestamp with a random number
        return "DT" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 5);
    }

}