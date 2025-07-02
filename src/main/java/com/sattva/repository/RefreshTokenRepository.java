package com.sattva.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sattva.model.RefreshToken;
import com.sattva.model.User;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken , String> {
    Optional<RefreshToken> findByToken(String token);
    void deleteByUser(User user);
    Optional<RefreshToken> findByUserId(String userId);
}