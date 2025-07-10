package com.sattva.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sattva.dto.CreateUserDTO;
import com.sattva.dto.LoginRequestDTO;
import com.sattva.dto.LoginResponseDTO;
import com.sattva.dto.LogoutRequest;
import com.sattva.dto.OTPLessResponse;
import com.sattva.dto.TokenRefreshRequest;
import com.sattva.dto.TokenRefreshResponse;
import com.sattva.model.RefreshToken;
import com.sattva.model.User;
import com.sattva.repository.UserRepository;
import com.sattva.security.JwtHelper;
// import com.sattva.service.AuthenticationService;
import com.sattva.service.RefreshTokenService;
import com.sattva.service.SmsService;
import com.sattva.service.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private JwtHelper jwtTokenProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private SmsService smsService;
    @Autowired
    private UserService userService;

    // @Autowired
    // private AuthenticationService authenticationService;

    @PostMapping("/send-otp")
    public OTPLessResponse sendOtp(@RequestBody CreateUserDTO userDto) {
        Optional<User> existing = userRepository.findByPhoneNumber(userDto.getPhoneNumber());
        boolean existUser = existing.isPresent();
        String userId = null;
        String userName = null;
        String fullName = null;
        boolean userOnboardingStatus = false;

        if (existUser) {
            User existingUser = existing.get();
            userId = existingUser.getId();
            fullName = existingUser.getFullName();
            userOnboardingStatus = existingUser.isUserOnboardingStatus();
        } else {
            // Create new user if not exists
            CreateUserDTO createUserDto = this.userService.createUser(userDto);
            userId = createUserDto.getId();
        }

        // Call smsService to send OTP
        return smsService.sendOtp(userDto, existUser, userId, userName, fullName, userOnboardingStatus);
    }

    
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO loginRequestDTO) {
        System.out.println("Received orderId: " + loginRequestDTO.getOrderId());
        System.out.println("Received otpNumber: " + loginRequestDTO.getOtpNumber());
        System.out.println("Received phoneNumber: " + loginRequestDTO.getPhoneNumber());

        boolean isValid = smsService.validatePhoneNumberAndOtpLess(
            loginRequestDTO.getOrderId(),
            loginRequestDTO.getOtpNumber(),
            loginRequestDTO.getPhoneNumber()
        );

        if (isValid) {
            // Fetch user by phone number
            Optional<User> userOptional = userRepository.findByPhoneNumber(loginRequestDTO.getPhoneNumber());

            if (userOptional.isPresent()) {
                User user = userOptional.get();
                String userId = user.getId(); // Get userId from the User entity

                // Generate JWT token and refresh token
                String jwtToken = smsService.generateToken(loginRequestDTO.getPhoneNumber(), userId);
                String refreshToken = refreshTokenService.createRefreshToken(user).getToken();

                // Return both tokens in LoginResponseDTO
                return ResponseEntity.ok(new LoginResponseDTO(jwtToken, refreshToken));
            } else {
                // If user is not found, return a response with null tokens or error message
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new LoginResponseDTO(null, null));
            }
        } else {
            // Return a response with null tokens for invalid OTP or phone number
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new LoginResponseDTO(null, null));
        }
    }

    // Refresh token endpoint remains the same
    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        Optional<RefreshToken> optionalRefreshToken = refreshTokenService.findByToken(requestRefreshToken);
        RefreshToken refreshToken = optionalRefreshToken
                .map(refreshTokenService::verifyExpiration)
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database or has expired!"));

        User user = refreshToken.getUser();
        String newToken = jwtTokenProvider.generateToken(user.getUsername(), user.getId());

        return ResponseEntity.ok(new TokenRefreshResponse(newToken, requestRefreshToken));
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody LogoutRequest request) {
    	userService.logoutUser(request.getUserId());
        return ResponseEntity.ok("Logout successful");
    }
}