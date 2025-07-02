package com.sattva.dto;

import com.sattva.enums.OtpStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@AllArgsConstructor
@NoArgsConstructor
@Data
public class OTPLessResponse {

	private OtpStatus status;
	private String message;
	private boolean flag;
	private String orderId;
	private String userId;
	private String userName;
	private String fullName;
	private boolean userOnboardingStatus;
}
