package com.sattva.service;

public interface AuthenticationService {
    boolean validatePhoneNumberAndOtp(String phoneNumber, int otp);
    boolean validatePhoneNumberAndOtpLess(String orderId, int otp,String phoneNumber);
    String generateToken(String phoneNumber, String userId);
}
