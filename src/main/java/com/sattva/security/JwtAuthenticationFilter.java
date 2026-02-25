package com.sattva.security;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtHelper jwtHelper;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // List all endpoints that should NOT require authentication
        if (path.startsWith("/api/auth/")|| path.startsWith("/oauth2/")) {
            filterChain.doFilter(request, response); // Skip JWT check
            return;
        }

        String requestHeader = request.getHeader("Authorization");
        logger.info("Authorization Header: {}", requestHeader);

        String token = null;
        String identifier = null;
        String userId = null;


        if (requestHeader != null && requestHeader.startsWith("Bearer ")) {
            token = requestHeader.substring(7);
            logger.info("JWT Token: {}", token);
            try {
                identifier = jwtHelper.getPhoneNumberFromToken(token);
                if (identifier == null) {
                    identifier = jwtHelper.getEmailFromToken(token);
                }
                userId = jwtHelper.getUserIdFromToken(token); // Log user ID if needed
                logger.info("Extracted identifier: {}, userId: {}", identifier, userId);
            } catch (Exception e) {
                logger.warn("Token validation error: {}", e.getMessage());
            }
        }

        if (identifier != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(identifier);

            if (userDetails != null) {
                UsernamePasswordAuthenticationToken authenticationToken = 
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                logger.info("User authenticated with identifier: {}", identifier);
            } else {
                logger.warn("UserDetails not found for identifier: {}", identifier);
            }
        }

        filterChain.doFilter(request, response);
    }
}
