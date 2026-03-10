package com.sattva.service.impl;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.sattva.exception.InvalidInputException;
import com.sattva.model.RefreshToken;
import com.sattva.model.User;
import com.sattva.repository.RefreshTokenRepository;
import com.sattva.repository.UserRepository;
import com.sattva.service.RefreshTokenService;

@Service
public class RefreshTokenServiceImpl implements RefreshTokenService {

    @Value("${app.refreshTokenExpirationMs:2592000000}") // 30 days for refresh token
    private long refreshTokenExpirationMs;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private UserRepository userRepository;

    // Find refresh token by token string
    @Override
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    // Create a new refresh token for a user
    // Add deviceId as a parameter to be saved in the RefreshToken table
    @Override
    public RefreshToken createRefreshToken(User user, String deviceId) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenExpirationMs));
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setDeviceId(deviceId);
        refreshToken.setLoginDate(Instant.now());
        
        return refreshTokenRepository.save(refreshToken);
    }

    // Check if the refresh token is expired
    public boolean isTokenExpired(RefreshToken token) {
        return token.getExpiryDate().isBefore(Instant.now());
    }

    // Delete refresh token by user
    @Override
    public void deleteByUser(User user) {
        refreshTokenRepository.deleteByUser(user);
    }

    // Verify if the refresh token is valid or expired, and delete if expired
    @Override
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (isTokenExpired(token)) {
            refreshTokenRepository.delete(token); // Delete expired token
            throw new InvalidInputException("Refresh token was expired. Please login again.");
        }
        return token;
    }
    // !!!!!!!   I should change this to regenerate a new token based on the selected deviceId and user.
    // Rotate the refresh token for added security (optional)
    public RefreshToken rotateRefreshToken(RefreshToken oldToken) {
//        refreshTokenRepository.delete(oldToken); // Invalidate old token
        oldToken.setToken(UUID.randomUUID().toString());
        oldToken.setExpiryDate(Instant.now().plusMillis(refreshTokenExpirationMs));
        oldToken.setLoginDate(Instant.now());
        refreshTokenRepository.save(oldToken);
        return oldToken; // Generate a new one
    }
}
