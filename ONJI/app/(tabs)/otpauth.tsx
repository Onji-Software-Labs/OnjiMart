import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Image, TextInput, TouchableOpacity, Alert, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

export default function OTPAuthScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [timer, setTimer] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const scaleAnimations = useRef(otp.map(() => new Animated.Value(1))).current;

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Animate scale when typing
    Animated.sequence([
      Animated.timing(scaleAnimations[index], {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimations[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Auto-focus previous input on backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  const handleBlur = () => {
    setFocusedIndex(null);
  };

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setIsResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const handleResendCode = () => {
    if (!isResendDisabled) {
      // Start 30 second timer
      setTimer(30);
      setIsResendDisabled(true);
    }
  };

  const handleContinue = () => {
    const otpCode = otp.join('');
    if (otpCode.length === 6) {
      Alert.alert('OTP Verification', `Entered OTP: ${otpCode}`);
    } else {
      Alert.alert('Error', 'Please enter a complete 6-digit OTP');
    }
  };

  // Check if OTP is complete
  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <View style={styles.container}>
      {/* Main Illustration */}
      <View style={styles.illustrationContainer}>
        <Image 
          source={require('@/assets/images/otp_screen.jpg')}
          style={styles.illustration}
          resizeMode="cover"
        />
      </View>

      {/* Content Section */}
      <View style={styles.contentContainer}>
        {/* Green Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('@/assets/images/onji_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <ThemedText style={styles.title}>
          Enter the 6 digit code sent via sms
        </ThemedText>

        {/* OTP Input Fields */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <Animated.View 
              key={index}
              style={{ transform: [{ scale: scaleAnimations[index] }] }}
            >
              <TextInput
                ref={(ref) => { inputRefs.current[index] = ref; }}
                style={[
                  styles.otpInput,
                  focusedIndex === index && styles.focusedInput,
                  digit && styles.filledInput
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                onFocus={() => handleFocus(index)}
                onBlur={handleBlur}
                keyboardType="numeric"
                maxLength={1}
                textAlign="center"
                selectTextOnFocus
              />
            </Animated.View>
          ))}
        </View>

        {/* Links Section */}
        <View style={styles.linksContainer}>
          <TouchableOpacity onPress={handleResendCode} disabled={isResendDisabled}>
            <View style={[
              styles.resendButtonWrapper,
              isResendDisabled && styles.resendButtonActive
            ]}>
              <ThemedText style={[
                styles.resendText,
                isResendDisabled && styles.resendTextActive
              ]}>
                {isResendDisabled ? `Resend code (${timer}s)` : 'Resend code'}
              </ThemedText>
            </View>
          </TouchableOpacity>
          <TouchableOpacity>
            <ThemedText style={styles.changeNumberText}>
              Change mobile number
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[
            styles.continueButton,
            isOtpComplete && styles.continueButtonActive
          ]} 
          onPress={handleContinue}
        >
          <ThemedText style={[
            styles.continueButtonText,
            isOtpComplete && styles.continueButtonTextActive
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
    backgroundColor: '#FFFFFF',
  },
  illustrationContainer: {
    flex: 0.35,
    width: '100%',
    marginTop: 60,
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flex: 0.55,
    paddingHorizontal: 24,
    paddingTop: 24,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 50,
    height: 50,
    tintColor: '#4CAF50',
  },
  title: {
    fontSize: 18,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 25,
  },
  otpInput: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 6,
    fontSize: 20,
    fontWeight: '400',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
  },
  focusedInput: {
    borderColor: '#007AFF',
    borderWidth: 2,
    backgroundColor: '#F8F9FF',
  },
  filledInput: {
    borderColor: '#4CAF50',
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  resendButtonWrapper: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#8B5CF6',
    backgroundColor: 'transparent',
  },
  resendButtonActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  resendText: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '400',
  },
  resendTextActive: {
    color: '#FFFFFF',
  },
  changeNumberText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '400',
    maxWidth: 150,
    textAlign: 'right',
  },
  buttonContainer: {
    flex: 0.1,
    paddingHorizontal: 24,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  continueButton: {
    backgroundColor: '#D1D5DB',
    paddingVertical: 16,
    borderRadius: 8,
    width: '100%',
  },
  continueButtonActive: {
    backgroundColor: '#4CAF50',
  },
  continueButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  continueButtonTextActive: {
    color: '#FFFFFF',
  },
});
