// package com.sattva.service.impl;


// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
// import org.springframework.security.core.Authentication;
// import org.springframework.security.core.context.SecurityContextHolder;
// import org.springframework.security.core.userdetails.UserDetails;
// import org.springframework.security.core.userdetails.UserDetailsService;
// import org.springframework.stereotype.Service;

// import com.otpless.authsdk.OTPAuth;
// import com.otpless.authsdk.OTPVerificationResponse;
// import com.sattva.security.JwtHelper;
// import com.sattva.service.AuthenticationService;
// import com.sattva.service.SmsService;
// import com.sattva.service.UserService;

// @Service
// public class AuthenticationServiceImpl implements AuthenticationService {
	
// 	@Autowired
// 	UserService userService;
// 	@Autowired
// 	SmsService smsService;
	
// 	@Autowired
// 	UserDetailsService userDetailsService;
	
// 	@Autowired
// 	JwtHelper jwtHelper;
	
// 	@Override
// 	public boolean validatePhoneNumberAndOtp(String phoneNumber, int otp) {
// 	    UserDetails userDetails = userDetailsService.loadUserByUsername(phoneNumber);

// 	    if (userDetails != null) {
// 	        boolean otpValidationSucceed = smsService.authenticateOtp(phoneNumber, otp);

// 	        if (otpValidationSucceed) {
// 	            Authentication authentication = new UsernamePasswordAuthenticationToken(
// 	                    userDetails, null, userDetails.getAuthorities());

// 	            SecurityContextHolder.getContext().setAuthentication(authentication);

// 	            return true;
// 	        }
// 	    }

// 	    return false;
// 	}


// 	@Override
//     public String generateToken(String phoneNumber, String userId) {
//         // Generate the token
// 		return jwtHelper.generateToken(phoneNumber, userId);
//     }
// 	private final String clientId = "THRB3063H5L7XY7MAXR8S6YROKY7IQ4N";
//     private final String clientSecret = "xf5ft4qzajj5ddie9zchzyk1vznqm6g2";

//     public boolean validatePhoneNumberAndOtpLess(String orderId, int otp, String phoneNumber) {
//         System.out.println("Validating OTP for orderId: " + orderId + ", otp: " + otp + ", phoneNumber: " + phoneNumber);
//         OTPAuth otpAuth = new OTPAuth(clientId, clientSecret);
//         OTPVerificationResponse verificationResponse = otpAuth.verifyOTP(orderId, String.valueOf(otp), phoneNumber, null);
//         System.out.println("OTP verification response: isSuccess=" + verificationResponse.isSuccess() +
//                            ", isOTPVerified=" + verificationResponse.getIsOTPVerified());
//         return verificationResponse.isSuccess() && verificationResponse.getIsOTPVerified();
//     }


// }
