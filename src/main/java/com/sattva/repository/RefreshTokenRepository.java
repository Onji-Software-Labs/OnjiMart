package com.sattva.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sattva.model.RefreshToken;
import com.sattva.model.User;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken , String> {
    Optional<RefreshToken> findByToken(String token);
    void deleteByUser(User user);
    Optional<List<RefreshToken>> findByUserId(String userId);
    Optional<RefreshToken> findByDeviceIdAndUserId(String deviceId,String userId);// find refreshToken selected by userId and deviceId
}