package com.sattva.dto;

import lombok.Data;

@Data
public class TokenRefreshRequest {
    private String refreshToken;
}