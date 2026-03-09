package com.sattva.dto;

import lombok.Data;

@Data
public class LogoutRequest {
	private String userId;
    private String deviceId;
}
