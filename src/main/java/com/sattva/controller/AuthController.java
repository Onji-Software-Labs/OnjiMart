package com.sattva.controller;

import java.util.*;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.sattva.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
import javax.management.Query;


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

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;
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
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO loginRequestDTO,
                                                  @CookieValue(value = "deviceId", required = false) String cookieDeviceId
    ) {
        String refreshToken ="";
        boolean isValid = smsService.validatePhoneNumberAndOtpLess(
                loginRequestDTO.getOrderId(),
                loginRequestDTO.getOtpNumber(),
                loginRequestDTO.getPhoneNumber(),
                loginRequestDTO.getDeviceId()
        );

        if (isValid) {
            // Fetch user by phone number
            Optional<User> userOptional = userRepository.findByPhoneNumber(loginRequestDTO.getPhoneNumber());

            if (userOptional.isPresent()) {
                User user = userOptional.get();
                String userId = user.getId(); // Get userId from the User entity
//              String bodyDeviceId= loginRequestDTO.getDeviceId(); // get device id from the request login

                // 1. Use deviceId from request body first (mobile)
                String deviceId = loginRequestDTO.getDeviceId() != null
                        ? loginRequestDTO.getDeviceId()
                        : cookieDeviceId; // 2. fallback to cookie (web)

                if (deviceId == null) {
                    throw new RuntimeException("Device ID not found");
                }

                System.out.println("Resolved deviceId: " + deviceId);
                // Check if device already used and saved
                Optional<RefreshToken> existingDeviceToken = refreshTokenRepository.findByDeviceIdAndUserId(deviceId,userId);

                //check number device used by the same user
                Optional<List<RefreshToken>> existingDeviceByUser = refreshTokenRepository.findByUserId(userId);
                int totalDevice = existingDeviceByUser.map(List::size).orElse(0);

                System.out.println("Number of devices used by this user  =======>  " + totalDevice);

                // login with same saved device
                if  (existingDeviceToken.isPresent()) {
                    RefreshToken oldDeviceToken = existingDeviceToken.get();
                    System.out.println("old Token for the existing device : "+oldDeviceToken.getToken());
                    RefreshToken regeneratedToken = refreshTokenService.rotateRefreshToken(oldDeviceToken);
                    refreshToken = regeneratedToken.getToken();
                    System.out.println("New Token Generated for same device  : "+refreshToken);

                }
                // login with New device and the user logged in with less than three devices

                if (existingDeviceToken.isEmpty() && totalDevice < 3 ){
                    refreshToken = refreshTokenService.createRefreshToken(user,deviceId).getToken(); // add deviceId as a parameter
                }

                // login with New device and the user had the maximum of device that can be logged with
                if (existingDeviceToken.isEmpty() && totalDevice >= 3 ){
//                    List<RefreshToken> deviceTokens = new ArrayList<>(); // déclaration globale dans la méthode

                    List<RefreshToken> devicesToken = existingDeviceByUser.get();
                    System.out.println("the three refresh tokens for the three existing devices ===============>  " + devicesToken);

                    RefreshToken oldestToken = devicesToken.stream()
                            .min(Comparator.comparing(RefreshToken::getLoginDate))
                            .get();

                    System.out.println("Oldest Token for the existing device "+deviceId +"  : "+ oldestToken.getToken() );

                    refreshTokenRepository.delete(oldestToken);
                    refreshToken = refreshTokenService.createRefreshToken(user,deviceId).getToken(); // add deviceId as a parameter

                }
                // Generate JWT token and refresh token
                String jwtToken = smsService.generateToken(loginRequestDTO.getPhoneNumber(), userId, "phoneNumber");
                //String refreshToken = refreshTokenService.createRefreshToken(user,deviceId).getToken(); // add deviceId as a parameter

                // Return both tokens in LoginResponseDTO
                return ResponseEntity.ok(new LoginResponseDTO(jwtToken, refreshToken, user.getPhoneNumber()));
            } else {
                // If user is not found, return a response with null tokens or error message
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new LoginResponseDTO(null, null,null));
            }
        } else {
            // Return a response with null tokens for invalid OTP or phone number
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new LoginResponseDTO(null, null,null));
        }
    }

  //  @PostMapping("/google")
//    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> payload) {
//        String idTokenString = payload.get("idToken");
//
//        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
//                new NetHttpTransport(), GsonFactory.getDefaultInstance())
//                .setAudience(Collections.singletonList(googleClientId))
//                .build();
//
//        try {
//            GoogleIdToken idToken = verifier.verify(idTokenString);
//            if (idToken == null) {
//                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid ID token");
//            }
//
//            GoogleIdToken.Payload p = idToken.getPayload();
//            String email = p.getEmail();
//            String name = (String) p.get("name");
//
//            User user = userRepository.findByEmail(email).orElseGet(() -> {
//                CreateUserDTO dto = new CreateUserDTO();
//                dto.setEmail(email);
//                dto.setFullName(name);
//                CreateUserDTO created = userService.createUser(dto);
//                return userRepository.findById(created.getId()).get();
//            });
//
//            String jwt = jwtTokenProvider.generateToken(user.getEmail(), user.getId(), "email");
//            String refresh = refreshTokenService.createRefreshToken(user,deviceId).getToken();
//
//            return ResponseEntity.ok(Map.of(
//                    "jwtToken", jwt,
//                    "refreshToken", refresh
//            ));
//
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token verification failed: " + e.getMessage());
//        }
//    }


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

        return ResponseEntity.ok(new TokenRefreshResponse(newToken, requestRefreshToken, user.getPhoneNumber()));
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody LogoutRequest request) {
    	userService.logoutUser(request.getDeviceId(), request.getUserId());
        return ResponseEntity.ok("Logout successful");
    }


}