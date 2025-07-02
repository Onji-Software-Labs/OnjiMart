package com.sattva.service;

import java.util.Optional;

import com.sattva.model.RefreshToken;
import com.sattva.model.User;

public interface RefreshTokenService {
	 public Optional<RefreshToken> findByToken(String token);
	public RefreshToken createRefreshToken(User user);
	public boolean isTokenExpired(RefreshToken token);
	public void deleteByUser(User user);
	public RefreshToken verifyExpiration(RefreshToken token);
}
