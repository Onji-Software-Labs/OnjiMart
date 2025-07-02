package com.sattva.dto;

import com.sattva.enums.OtpStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OtpResponseDTO {

	private OtpStatus status;
	private String message;
	private boolean flag;
	private String orderId;
	private String userId;
	private String userName;
	private String fullName;
	private boolean userOnboardingStatus;
	int otp;
//	private String message;
//    private boolean userExists;
//    private String userId;
//    private String userName;
//    private String fullName;
//    private boolean userOnboardingStatus;
//    private int otp;
}
