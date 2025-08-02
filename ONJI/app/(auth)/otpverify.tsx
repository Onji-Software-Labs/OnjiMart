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
import axiosInstance from '@/lib/api/axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const inputRefs = useRef<TextInput[]>([]);

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

  const handleContinue = async () => {
    if (!isOtpComplete || isVerifying) {
      setIsError(true);
      setErrorMessage('Please enter the complete 6-digit code.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      return;
    }
    setIsVerifying(true);
    const enteredOtp = otp.join('');
    try {
      
      const res=await axiosInstance.post('/api/auth/login', {
        phoneNumber: phoneNumber,
        otpNumber: enteredOtp,
      });

      await AsyncStorage.setItem("token",res.data.jwtToken);
      await AsyncStorage.setItem("refreshToken",res.data.refreshToken)

      console.log(res.data)

      setIsError(false);
      setErrorMessage('');
      router.replace('/(auth)/personalProfile');
    } catch (error: any) {
      setIsError(true);
      setErrorMessage('Incorrect OTP or verification failed.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (resendDisabled) return;
    setCountdown(30);
    setResendDisabled(true);
    setShowSuccessMessage(true);
    setOtp(['', '', '', '', '', '']);
    setIsError(false);
    setErrorMessage('');
    try {
      await axiosInstance.post('/api/auth/send-otp', {
        phoneNumber: phoneNumber,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    }
  };

  const handleChangeNumber = () => {
    router.back();
  };

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
