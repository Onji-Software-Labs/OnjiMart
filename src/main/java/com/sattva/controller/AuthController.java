package com.sattva.controller;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
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

import javax.imageio.spi.IIORegistry;


@RestController
@CrossOrigin
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

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

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
                String jwtToken = smsService.generateToken(loginRequestDTO.getPhoneNumber(), userId, "phoneNumber");
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

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> payload) {
        String idTokenString = payload.get("idToken");

        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        try {
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid ID token");
            }

            GoogleIdToken.Payload p = idToken.getPayload();
            String email = p.getEmail();
            String name = (String) p.get("name");

            User user = userRepository.findByEmail(email).orElseGet(() -> {
                CreateUserDTO dto = new CreateUserDTO();
                dto.setEmail(email);
                dto.setFullName(name);
                CreateUserDTO created = userService.createUser(dto);
                return userRepository.findById(created.getId()).get();
            });

            String jwt = jwtTokenProvider.generateToken(user.getEmail(), user.getId(), "email");
            String refresh = refreshTokenService.createRefreshToken(user).getToken();

            return ResponseEntity.ok(Map.of(
                    "jwtToken", jwt,
                    "refreshToken", refresh
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token verification failed: " + e.getMessage());
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
        String newToken;
        if (user.getEmail() != null && !user.getEmail().isEmpty()) {
            // Email login
            newToken = jwtTokenProvider.generateToken(user.getEmail(), user.getId(), "email");
        } else {
            // OTP login
            newToken = jwtTokenProvider.generateToken(user.getUsername(), user.getId(), "phoneNumber");
        }

        return ResponseEntity.ok(new TokenRefreshResponse(newToken, requestRefreshToken));
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody LogoutRequest request) {
    	userService.logoutUser(request.getUserId());
        return ResponseEntity.ok("Logout successful");
    }


}