//package com.sattva.security;
//
//import jakarta.servlet.http.Cookie;
//import jakarta.servlet.http.HttpServletRequest;
//import org.springframework.stereotype.Component;
//
//import java.util.Arrays;
//
//@Component
//public class DeviceIdResolver {
//
//    private static final String DEVICE_COOKIE_NAME = "deviceId";
//
//    public static String resolve(HttpServletRequest request, String bodyDeviceId) {
//
//        // Mobile → sent in body
//        if (bodyDeviceId != null && !bodyDeviceId.isBlank()) {
//            System.out.println("DEvice ID from mobile");
//            return bodyDeviceId;
//        }
//
//        //  Web → stored in cookie
//        if (request.getCookies() != null) {
//            for (Cookie cookie : request.getCookies()) {
//                if ("deviceId".equals(cookie.getName())) {
//                    System.out.println("Device ID from Cookies");
//                    return cookie.getValue();
//
//                }
//            }
//        }
//
//        // fallback for first-time request: check attribute
//        Object attr = request.getAttribute("deviceId");
//        if (attr != null) {
//            return attr.toString();
//        }
//
//
//        return null;
//    }
//}