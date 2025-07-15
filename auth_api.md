# Authentication API Documentation

**Base URL**: `https://example.ngrok-free.app/api/auth`

---

## 1. POST `/send-otp`

**Description**:  
Sends OTP on WhatsApp to the entered number via Wati. Creates user if he/ she does not exist.

**Request**:  
`POST /send-otp`  
**Content-Type**: `application/json`

**Body**:
```json
{
    "phoneNumber": "string"
}
```

**Response**:
```json
{
    "status": "DELIVERED",
    "message": "OTP sent via WhatsApp",
    "flag": false,
    "orderId": null,
    "userId": null,
    "userName": null,
    "fullName": null,
    "userOnboardingStatus": false
}
```

## 2. POST `/login`

**Description**:  
Authenticates user through entered otp and returns a jwt and refresh token.

**Request**:  
`POST /login`  
**Content-Type**: `application/json`

**Body**:
```json
{
    "phoneNumber": "string",  
    "otpNumber": "string" 
}
```

**Response**:
```json
{
    "jwtToken": "string",
    "refreshToken": "string"
}
```
