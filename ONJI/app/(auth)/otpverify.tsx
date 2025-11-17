import { ThemedText } from '@/components/ui/ThemedText';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Keyboard,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import axiosInstance from '@/lib/api/axiosConfig';

const { width, height } = Dimensions.get('window');

export default function OTPVerification() {
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSessionId, setOtpSessionId] = useState<string | null>(null);
  const inputRefs = useRef<TextInput[]>([]);

  const normalizedPhoneNumber = phoneNumber.startsWith('+91')
    ? phoneNumber
    : `+91${phoneNumber}`;

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [countdown, resendDisabled]);

  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => setShowSuccessMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (isError) {
      setIsError(false);
      setErrorMessage('');
    }
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (value && index === 5) {
      Keyboard.dismiss();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  // Resend OTP
  const handleResendCode = async () => {
    if (resendDisabled) return;

    setCountdown(30);
    setResendDisabled(true);
    setShowSuccessMessage(true);
    setOtp(['', '', '', '', '', '']);
    setIsError(false);
    setErrorMessage('');

    const payload = {
      userNames: "UserName",
      fullName: "Full Name",
      phoneNumber: normalizedPhoneNumber,
      email: "example@email.com",
      userType: "USER",
      userOnboardingStatus: true,
      supplier: false
    };

    console.log('Sending OTP payload:', payload);

    try {
      const response = await axiosInstance.post('/api/auth/send-otp', payload);
      console.log("Full OTP Send Response:", JSON.stringify(response.data, null, 2));

      // ✅ Handle different response structures
      let sessionId = null;
      
      // Check various possible locations for session ID
      if (response.data.id) {
        sessionId = response.data.id;
      } else if (response.data.sessionId) {
        sessionId = response.data.sessionId;
      } else if (response.data.data?.id) {
        sessionId = response.data.data.id;
      } else if (response.data.data?.sessionId) {
        sessionId = response.data.data.sessionId;
      } else if (response.data.result?.id) {
        sessionId = response.data.result.id;
      } else if (response.data.result?.sessionId) {
        sessionId = response.data.result.sessionId;
      } else if (response.data.otpSessionId) {
        sessionId = response.data.otpSessionId;
      } else if (response.data.sessionID) {
        sessionId = response.data.sessionID;
      }

      if (sessionId) {
        setOtpSessionId(sessionId);
        console.log("✅ OTP Session ID saved:", sessionId);
        
        // Store in localStorage as fallback
        if (typeof window !== 'undefined') {
          localStorage.setItem('otpSessionId', sessionId);
        }
      } else {
        console.warn("❌ No OTP sessionId found in response structure");
        
        // Try to use previously stored session ID
        const storedSessionId = typeof window !== 'undefined' ? localStorage.getItem('otpSessionId') : null;
        if (storedSessionId) {
          setOtpSessionId(storedSessionId);
          console.log("Using stored session ID as fallback:", storedSessionId);
        } else {
          // Generate fallback session ID
          const fallbackSessionId = Date.now().toString();
          setOtpSessionId(fallbackSessionId);
          console.log("Using generated fallback session ID:", fallbackSessionId);
        }
      }

      setShowSuccessMessage(true);
    } catch (error: any) {
      console.error('Failed to send OTP:', error.response?.data || error.message);
      setIsError(true);
      setErrorMessage('Failed to resend OTP. Please try again.');
    }
  };

  // Verify OTP
  const handleContinue = async () => {
    if (!isOtpComplete || isVerifying) {
      setIsError(true);
      setErrorMessage('Please enter the complete 6-digit code.');
      inputRefs.current[0]?.focus();
      return;
    }

    // Use stored session ID if state is null
    let verificationSessionId = otpSessionId;
    if (!verificationSessionId && typeof window !== 'undefined') {
      verificationSessionId = localStorage.getItem('otpSessionId');
      if (verificationSessionId) {
        setOtpSessionId(verificationSessionId);
        console.log("Using stored session ID for verification:", verificationSessionId);
      }
    }

    if (!verificationSessionId) {
      setIsError(true);
      setErrorMessage('OTP session not found. Please resend OTP.');
      return;
    }

    setIsVerifying(true);
    const enteredOtp = otp.join('');

    const payload = {
      phoneNumber: normalizedPhoneNumber,
      otpNumber: enteredOtp,
      id: verificationSessionId,
    };

    console.log('Verifying OTP with payload:', payload);
    console.log('Using OTP Session ID:', verificationSessionId);

    try {
      const response = await axiosInstance.post('/api/auth/login', payload);
      console.log('OTP verification response:', response.data);

      if (response.data.status === 'FAILED' || !response.data.jwtToken) {
        setIsError(true);
        setErrorMessage(response.data.message || 'OTP verification failed.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setIsError(false);
        setErrorMessage('');
        
        // Clear stored session ID on success
        if (typeof window !== 'undefined') {
          localStorage.removeItem('otpSessionId');
        }
        
        router.replace('/(auth)/personalProfile');
      }
    } catch (error: any) {
      console.error('OTP verification error:', error.response?.data || error.message);
      setIsError(true);
      
      // More specific error messages
      if (error.response?.status === 400) {
        setErrorMessage('Invalid OTP. Please check and try again.');
      } else if (error.response?.status === 404) {
        setErrorMessage('OTP session expired. Please resend OTP.');
      } else if (error.response?.status === 500) {
        setErrorMessage('Server error. Please try again later.');
      } else {
        setErrorMessage('Incorrect OTP or verification failed.');
      }
      
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleChangeNumber = () => router.back();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.headerImageContainer}>
        <Image
          source={require('@/assets/images/otp_screen.jpg')}
          style={styles.headerImage}
          resizeMode="cover"
        />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <Image
            source={require('@/assets/images/onjilogo.png')}
            style={styles.iconLogo}
            resizeMode="contain"
          />
        </View>
        <ThemedText style={styles.title}>
          Enter the 6 digit code sent via SMS to{'\n'}{phoneNumber}
        </ThemedText>
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) inputRefs.current[index] = ref;
              }}
              style={[
                styles.otpInput,
                isError && styles.otpInputError,
                digit && styles.otpInputFilled
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="numeric"
              maxLength={1}
              selectTextOnFocus
              textAlign="center"
            />
          ))}
        </View>

        {isError && (
          <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
        )}
        {showSuccessMessage && (
          <ThemedText style={styles.successText}>New code sent</ThemedText>
        )}

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.resendButton, resendDisabled && styles.disabledButton]}
            onPress={handleResendCode}
            disabled={resendDisabled}
          >
            <ThemedText style={[styles.resendText, resendDisabled && styles.disabledText]}>
              {resendDisabled ? `Resend code (${countdown}s)` : 'Resend code'}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.changeNumberButton} onPress={handleChangeNumber}>
            <ThemedText style={styles.changeNumberText}>Change mobile number</ThemedText>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!isOtpComplete || isVerifying) && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!isOtpComplete || isVerifying}
        >
          <ThemedText style={[
            styles.continueText,
            (!isOtpComplete || isVerifying) && styles.continueTextDisabled
          ]}>
            {isVerifying ? 'Verifying...' : 'Continue'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerImageContainer: {
    height: height * 0.35, // 35% of screen height
    width: '100%',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
    backgroundColor: '#fff',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconLogo: {
    width: 50,
    height: 80,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 32,
    color: '#333',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    backgroundColor: '#fff',
    color: '#333',
    textAlignVertical: 'center',
  },
  otpInputFilled: {
    borderColor: '#4CAF50',
  },
  otpInputError: {
    borderColor: '#FF5252',
  },
  errorText: {
    color: '#FF5252',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
  successText: {
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 48,
    paddingHorizontal: 8,
  },
  resendButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#DCD0FF',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendText: {
    color: '#8E24AA',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  changeNumberButton: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeNumberText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#8E24AA',
    borderColor: '#8E24AA',
  },
  disabledText: {
    color: '#FFFFFF',
  },
  continueButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    marginTop: 'auto',
    marginBottom: 34,
  },
  continueButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  continueTextDisabled: {
    color: '#999',
  },
});
