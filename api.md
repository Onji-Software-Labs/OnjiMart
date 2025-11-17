# Onji API Documentation

## Authentication API

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

## 3. POST `/logout`

**Description**:  
Deletes refresh-token corresponding to the entered userId.

**Request**:  
`POST /logout`  
**Content-Type**: `application/json`

**Body**:
```json
{
    "userId": "string"
}
```

**Response**:
```raw
{
    Logout successful
}
```

## Retailer API

**Base URL**: `https://example.ngrok-free.app/retailers`

---

## 1. GET `/{retailerId}/suppliers`

**Description**: 
Returns all suppliers for a given retailer.

**Request**:  
`GET /{retailerId}/suppliers`  

**Response**:
```json
[
    {
        "id": "string",
        "fullName": "string",
        "email": "string",
        "rating": double,
        "pincode": "string",
        "categoryIds": [
            "string"
        ],
        "subCategoryIds": [
            "string"
        ]
    }
]
```

## 2. POST `/{retailerId}/suppliers/filterSuppliers`

**Description**:  
Filter suppliers by multiple parameters.

**Request**:  
`POST /{retailerId}/suppliers/filterSuppliers`  
**Content-Type**: `application/json`

**Body**:
```json
{
    "categoryNames": ["string", "string", ...],
    "pincodeFilter": "myPincode" OR "others",
    "rating": 1.0 to 5.0
}
```

**Response**:
```json
[
    {
        "id": "string",
        "fullName": "string",
        "email": "string",
        "rating": double,
        "pincode": "string",
        "categoryIds": [
            "string"
        ],
        "subCategoryIds": [
            "string"
        ]
    }
]
```

## Supplier API

**Base URL**: `https://example.ngrok-free.app/api/supplier-business`

---

## 1. POST `/create-full`

**Description**:  
Add supplier's business details. Requires user to have supplier role.

**Request**:  
`POST /create-full`  
**Content-Type**: `application/json`

**Body**:
```json
{
    "supplierId" : "string",
    "address" : "string",
    "city" : "string",
    "pincode" : "string",
    "contactNumber" : "string",
    "categoryIds" : ["string", ...],
    "subCategoryIds" : ["string", ...]
}
```

**Response**:
```json
{
    "id": "string",
    "fullName": "string",
    "pincode": "string",
    "categoryIds": ["string", ...],
    "subCategoryIds": ["string", ...]
}
```
