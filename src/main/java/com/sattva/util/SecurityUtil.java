package com.sattva.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.sattva.model.User;

public class SecurityUtil {

    // Method to get the current user ID from Spring Security Context
    public static String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            Object principal = auth.getPrincipal();
            if (principal instanceof User) {
                return ((User) principal).getId();
            }
        }
        return "1"; // Default ID for system-initiated actions
    }
}