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
    public String generateToken(String identifier, String userId,String type) {
        Map<String, Object> claims = new HashMap<>();
        claims.put(type, identifier); //type = "phoneNumber" or "email"
        claims.put("userId", userId); // Embed userId in the token

        String token = doGenerateToken(claims, identifier);

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
    public Boolean validateToken(String token, String identifier, String userId, String type) {
        String storedIdentifier = getClaimFromToken(token, claims -> (String) claims.get(type));
        String storedUserId = getUserIdFromToken(token);
        return (storedIdentifier.equals(identifier) && storedUserId.equals(userId) && !isTokenExpired(token));
    }


    public Boolean validateTokenByEmail(String token, String email) {
        final String storedEmail = getEmailFromToken(token);
        return (storedEmail.equals(email) && !isTokenExpired(token));
    }


    // Retrieve phone number from token
    public String getPhoneNumberFromToken(String token) {
        return getClaimFromToken(token, claims -> (String) claims.get("phoneNumber"));
    }

    public  String getEmailFromToken(String token) {
        return getClaimFromToken(token, claims -> (String) claims.get("email"));
    }
}
