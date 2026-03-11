package com.sattva.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Arrays;
import java.util.UUID;

@Component
public class DeviceIdFilter extends OncePerRequestFilter {

    private static final String DEVICE_COOKIE_NAME = "deviceId";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        boolean deviceCookieExists = false;

        if (request.getCookies() != null) {
            deviceCookieExists = Arrays.stream(request.getCookies())
                    .anyMatch(cookie -> DEVICE_COOKIE_NAME.equals(cookie.getName()));
            System.out.println("deviceId cookies exists ");
        }

        if (!deviceCookieExists) {

            String deviceId = UUID.randomUUID().toString();

            ResponseCookie cookie = ResponseCookie.from(DEVICE_COOKIE_NAME, deviceId)
                    .httpOnly(true)               // Not accessible via JS
                    .secure(true)                 // HTTPS only (set false in local dev if needed)
                    .sameSite("None")           // CSRF protection for production use "None"
                    .path("/")
                    .maxAge(Duration.ofDays(30))  // 30 days persistence
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
            // 🔥 Pass deviceId to controller in the same request
            request.setAttribute(DEVICE_COOKIE_NAME, deviceId);

            System.out.println("Creating deviceId cookie: " + deviceId);
        }

        filterChain.doFilter(request, response);
        System.out.println("DeviceIdFilter executed");

    }
}