package com.sattva.enums;

public enum UserStatus {
    ACTIVE,       // User is active and has full access
    INACTIVE,     // User account exists but is not active
    SUSPENDED,    // User account is temporarily disabled or restricted
    DELETED       // User account has been marked as deleted (soft delete)
}
