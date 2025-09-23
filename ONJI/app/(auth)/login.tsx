import React, { useState } from 'react';
import { LogBox, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axiosInstance from '@/lib/api/axiosConfig';

LogBox.ignoreLogs([
  'Invalid prop `style` supplied to `React.Fragment`',
]);

export default function CreateAccount() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validatePhoneNumber = (number: string) => {
    const cleanNumber = number.replace(/\D/g, '');
    return /^[6-9]\d{9}$/.test(cleanNumber);
  };

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    setPhoneNumber(cleaned);
    if (cleaned.length > 0) {
      setIsValid(validatePhoneNumber(cleaned));
    } else {
      setIsValid(true);
    }
  };

  const handleContinue = async () => {
    if (!isButtonActive || isLoading) return;
    setIsLoading(true);
    const fullPhoneNumber = '+91' + phoneNumber;

    try {
      // Use your axiosInstance to ensure custom headers are sent
      await axiosInstance.post('/api/auth/send-otp', {
        phoneNumber: fullPhoneNumber,
      });

      router.push({
        pathname: '/otpverify',
        params: { phoneNumber: fullPhoneNumber }
      });
    } catch (e) {
      Alert.alert("Error", "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSignup = () => {
    // Navigate to signup page
    router.push('/signup');
  };

  const isButtonActive = phoneNumber.length === 10 && isValid;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F5E8" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <LinearGradient
          colors={['#E8F5E8', '#F0F8F0']}
          style={styles.header}
        >
          <Image
            source={require('@/assets/images/vegnfru.png')}
            style={styles.vegImage}
            resizeMode="contain"
          />
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/onjilogo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Built on trust. Grown with care. Delivered fresh.</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mobile number</Text>
            <View style={[
              styles.phoneInputContainer,
              phoneNumber.length > 0 && !isValid && styles.phoneInputError
            ]}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.phoneInput}
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                placeholder="enter your mobile number"
                keyboardType="number-pad"
                maxLength={10}
                returnKeyType="done"
              />
            </View>
            {phoneNumber.length > 0 && !isValid && (
              <Text style={styles.errorText}>Phone number is not valid</Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.continueButton,
              isButtonActive ? styles.continueButtonActive : styles.continueButtonDisabled
            ]}
            disabled={!isButtonActive || isLoading}
            activeOpacity={0.8}
            onPress={handleContinue}
          >
            <Text style={[
              styles.continueButtonText,
              isButtonActive ? styles.continueButtonTextActive : styles.continueButtonTextDisabled
            ]}>
              {isLoading ? "Please wait..." : "Continue"}
            </Text>
          </TouchableOpacity>
          
          
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'visible',
  },
  vegImage: {
    width: 375,
    height: 256,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins',
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 40,
  },
  inputLabel: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 8,
    fontWeight: '500',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#FFFFFF',
  },
  phoneInputError: {
    borderColor: '#F44336',
  },
  countryCode: {
    fontSize: 16,
    color: '#1A1A1A',
    marginRight: 8,
    fontWeight: '500',
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    paddingVertical: 0,
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
  },
  continueButton: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  continueButtonActive: {
    backgroundColor: '#4CAF50',
  },
  continueButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  continueButtonTextActive: {
    color: '#FFFFFF',
  },
  continueButtonTextDisabled: {
    color: '#9E9E9E',
  },
  signupLink: {
    marginTop: 10,
  },
  signupText: {
    fontSize: 14,
    color: '#666666',
  },
  signupLinkText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
});