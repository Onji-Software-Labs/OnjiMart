package com.sattva.security;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

@Component
public class JwtHelper {

    private static final long JWT_TOKEN_VALIDITY = 30 * 24 * 60 * 60; // 30 days

    private final String secret = "afafasfafafasfasfasfafacasdasfasxASFACASDFACASDFASFASFDAFASFASDAADSCSDFADCVSGCFVADXCcadwavfsfarvf";

    // Retrieve username (phone number) from jwt token
    public String getUsernameFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }

    // Retrieve user id from jwt token
    public String getUserIdFromToken(String token) {
        return getClaimFromToken(token, claims -> (String) claims.get("userId"));
    }

    // Retrieve expiration date from jwt token
    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    // For retrieving any information from token, we need the secret key
    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parser().setSigningKey(secret).parseClaimsJws(token).getBody();
    }

    // Check if the token has expired
    private Boolean isTokenExpired(String token) {
        final Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }

    // Generate token with phoneNumber and userId
    public String generateToken(String phoneNumber, String userId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("phoneNumber", phoneNumber);
        claims.put("userId", userId); // Embed userId in the token

        String token = doGenerateToken(claims, phoneNumber);
        
        // Debugging logs to verify token generation
        System.out.println("Generated Token: " + token);
        System.out.println("With Claims - phoneNumber: " + phoneNumber + ", userId: " + userId);

        return token;
    }

    private String doGenerateToken(Map<String, Object> claims, String subject) {
        Date expirationDate = new Date(System.currentTimeMillis() + JWT_TOKEN_VALIDITY * 1000);
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(expirationDate)
                .signWith(SignatureAlgorithm.HS512, secret)
                .compact();
    }

    // Validate token with phone number
    public Boolean validateToken(String token, String phoneNumber) {
        final String storedPhoneNumber = getPhoneNumberFromToken(token);
        return (storedPhoneNumber.equals(phoneNumber) && !isTokenExpired(token));
    }

    // Retrieve phone number from token
    public String getPhoneNumberFromToken(String token) {
        return getClaimFromToken(token, claims -> (String) claims.get("phoneNumber"));
    }
}
