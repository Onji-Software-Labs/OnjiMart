import { ThemedText } from '@/components/ui/ThemedText';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
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

const { width, height } = Dimensions.get('window');

export default function OTPVerification() {
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const inputRefs = useRef<TextInput[]>([]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [countdown, resendDisabled]);

  // Hide success message after 3 seconds
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => setShowSuccessMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  const handleOtpChange = (value: string, index: number) => {
    // Only allow single digit
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Clear error state when user starts typing
    if (isError) {
      setIsError(false);
      setErrorMessage('');
    }

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (value && index === 5) {
      Keyboard.dismiss();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    // Handle backspace
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  const handleContinue = () => {
    if (!isOtpComplete) {
      setIsError(true);
      setErrorMessage('Please enter the complete 6-digit code.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      return;
    }

    // Simulate OTP verification
    const enteredOtp = otp.join('');
    const correctOtp = '123456'; // Simulated correct OTP

    if (enteredOtp === correctOtp) {
      router.replace("/(auth)/BusinessDetailsScreen");
      // Alert.alert('Success', 'OTP verified successfully!', [
      //   {
      //     text: 'OK',
      //     onPress: () => {
      //       // Navigate to next screen (e.g., home or dashboard)
      //       router.replace("/(auth)/BusinessDetailsScreen"); // Example for retailer
      //       // router.replace('/(tabs)/home'); // Example for retailer
      //     }
      //   }
      // ]);

      setIsError(false);
      setErrorMessage('');
    } else {
      setIsError(true);
      setErrorMessage('Incorrect OTP');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendCode = () => {
    if (resendDisabled) return;

    // Reset countdown and disable resend button
    setCountdown(30);
    setResendDisabled(true);
    
    // Show success message
    setShowSuccessMessage(true);
    
    // Clear current OTP
    setOtp(['', '', '', '', '', '']);
    setIsError(false);
    setErrorMessage('');
  };

  const handleChangeNumber = () => {
    // Navigate back to the create account screen
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header Market Scene Image */}
      <View style={styles.headerImageContainer}>
        <Image
          source={require('@/assets/images/otp_screen.jpg')}
          style={styles.headerImage}
          resizeMode="cover"
        />
      </View>

      {/* Content Container */}
      <View style={styles.contentContainer}>
        {/* ONJI Logo Icon */}
        <View style={styles.iconContainer}>
          <Image
            source={require('@/assets/images/onjilogo.png')}
            style={styles.iconLogo}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <ThemedText style={styles.title}>
          Enter the 6 digit code sent via SMS to{'\n'}+91 {phoneNumber}
        </ThemedText>

        {/* OTP Input Boxes */}
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

        {/* Error Message */}
        {isError && (
          <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
        )}

        {/* Success Message */}
        {showSuccessMessage && (
          <ThemedText style={styles.successText}>New code sent</ThemedText>
        )}

        {/* Action Buttons Container */}
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

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            !isOtpComplete && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!isOtpComplete}
        >
          <ThemedText style={[
            styles.continueText,
            !isOtpComplete && styles.continueTextDisabled
          ]}>
            Continue
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
