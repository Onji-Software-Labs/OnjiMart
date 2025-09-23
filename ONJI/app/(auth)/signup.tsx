import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
   Text,
   View,
   TouchableOpacity,
   SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

const BACKEND_URL = 'https://95ae47ab0d4e.ngrok-free.app/api/auth/google'; // Replace with your backend URL

export default function SignupScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);

  // Google Auth Request
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '536860370018-h4rat081a473laklpo3jmv3hi71la2fi.apps.googleusercontent.com',
  });

// Screens for sequential navigation
  const screens = [
    '/personalProfile',
    '/buisnessScreen',
    '/BusinessDetailsScreen',
    '/home', // Inventory
  ] as const;

  type AppRoute = typeof screens[number];

  // Sequential navigation helper with delay
  const navigateSequentially = () => {
    let index = 0;

    const navigateNext = () => {
      if (index < screens.length) {
        const screen: AppRoute = screens[index];
        if (index === screens.length - 1) {
          router.replace(screen);
        } else {
          router.push(screen);
        }
        index++;
        setTimeout(navigateNext, 100000000); // 300ms delay between screens
      }
    };

    navigateNext(); // Start navigation
  };

  // Handle Google response
  useEffect(() => {
    if (response?.type === 'success') {
      navigateSequentially();
    }
  }, [response]);
  // Handle Google response
  useEffect(() => {
    const fetchJWT = async () => {
      if (response?.type === 'success' && response.params?.id_token) {
        setIsLoading(true);
        try {
          const res = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: response.params.id_token }),
          });

          if (!res.ok) throw new Error('Failed to get JWT from backend');

          const data = await res.json();

          // Store JWT and refresh token
          await AsyncStorage.setItem('JWTtoken', data.jwtToken);
          await AsyncStorage.setItem('refreshToken', data.refreshToken);
          console.log('JWT Response from backend:', data);


          // Navigate to next screen
          router.replace('/personalProfile');
        } catch (error) {
          console.error(error);
          Alert.alert('Error', 'Google login failed');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchJWT();
  }, [response]);

  // Navigate to login screen
  const navigateToLogin = () => {
    router.push('/login');
  };

  // Phone signup flow
    const handlePhoneSignUp = () => {
    setIsPhoneLoading(true);

    type AppRoute =
      | '/login'
      | '/otpverify'
      | '/personalProfile'
      | '/buisnessScreen'
      | '/BusinessDetailsScreen'
      | '/home';

    const phoneScreens: AppRoute[] = [
      '/login',
      '/otpverify',
      '/personalProfile',
      '/buisnessScreen',
      '/BusinessDetailsScreen',
      '/home',
    ];

    let index = 0;

    const navigateNext = () => {
      if (index < phoneScreens.length) {
        if (index === phoneScreens.length - 1) {
          router.replace(phoneScreens[index]);
        } else {
          router.push(phoneScreens[index]);
        }
        index++;
      } else {
        setIsPhoneLoading(false);
      }
    };

    navigateNext();
  };

  // Trigger Google login
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await promptAsync();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Google sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <LinearGradient colors={['#feffffff', '#b5d2f1ff']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#eff6faff" />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <View style={styles.logoContainer}>
            <Image source={require('@/assets/images/onjilogo.png')} style={styles.logoImage} resizeMode="contain" />
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>Built on trust. Grown with care. Delivered fresh.</Text>
          </View>

          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, isPhoneLoading && styles.buttonDisabled]}
              onPress={handlePhoneSignUp}
              disabled={isPhoneLoading}
            >
              <View style={styles.buttonContent}>
                {isPhoneLoading
                  ? <ActivityIndicator size="small" color="#0a0b0aff" />
                  : <Ionicons name="call-outline" size={20} color="#0a0b0aff" />
                }
                <Text style={styles.buttonText}>
                  {isPhoneLoading ? 'Processing...' : 'Continue with Phone number'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleGoogleSignIn}
              disabled={isLoading || !request}
            >
              <View style={styles.buttonContent}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#1e5830ff" />
                ) : (
                  <>
                    <View style={styles.googleIconContainer}>
                      <View style={styles.googleIcon}>
                        <View style={[styles.googlePart, styles.googleBlue]}></View>
                        <View style={[styles.googlePart, styles.googleRed]}></View>
                        <View style={[styles.googlePart, styles.googleYellow]}></View>
                        <View style={[styles.googlePart, styles.googleGreen]}></View>
                        <View style={styles.googleCenterCutout}></View>
                        <View style={styles.googleLetterG}></View>
                      </View>
                    </View>
                    <Text style={styles.buttonText}>Continue with Gmail</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 20, justifyContent: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoImage: { width: 120, height: 120 },
  titleContainer: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 14, fontWeight: '400', color: '#666666', textAlign: 'center', lineHeight: 18, paddingHorizontal: 20 },
  separatorContainer: { alignItems: 'center', marginBottom: 32 },
  separatorLine: { height: 1, width: '100%', backgroundColor: '#E8E8E8' },
  buttonsContainer: { width: '100%', marginBottom: 24 },
  button: { width: '100%', backgroundColor: '#f1f7f8ff', paddingVertical: 16, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#e7ececff' },
  buttonDisabled: { opacity: 0.7 },
  buttonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  buttonText: { fontSize: 16, fontWeight: '500', color: '#1e5830ff' },
  googleIconContainer: { width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  googleIcon: { width: 20, height: 20, borderRadius: 10, backgroundColor: 'white', position: 'relative', justifyContent: 'center', alignItems: 'center' },
  googlePart: { position: 'absolute', width: 10, height: 10 },
  googleBlue: { backgroundColor: '#4285F4', top: 0, left: 0, borderTopLeftRadius: 10 },
  googleRed: { backgroundColor: '#EA4335', top: 0, right: 0, borderTopRightRadius: 10 },
  googleYellow: { backgroundColor: '#FBBC05', bottom: 0, left: 0, borderBottomLeftRadius: 10 },
  googleGreen: { backgroundColor: '#34A853', bottom: 0, right: 0, borderBottomRightRadius: 10 },
  googleCenterCutout: { position: 'absolute', width: 12, height: 12, borderRadius: 6, backgroundColor: 'white' },
  googleLetterG: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: '#4285F4',
    borderRightColor: 'transparent',
    borderBottomColor: '#34A853',
    borderLeftColor: '#FBBC05',
    borderRadius: 3,
    transform: [{ rotate: '-10deg' }],
  },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  loginText: { fontSize: 16, color: '#090a0aff' },
  loginLink: { fontSize: 16, color: '#057b4eff', fontWeight: '600' },
});