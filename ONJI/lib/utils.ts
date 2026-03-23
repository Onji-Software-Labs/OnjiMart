import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';

/**
 * Returns a stable unique deviceId per app installation.
 * - Generated once
 * - Stored securely in SecureStore (mobile)
 * - Stored in localStorage (web)
 */

export const getDeviceId = async () => {

  // 🌐 Web
  if (Platform.OS === 'web') {

    let deviceId = localStorage.getItem('deviceId');

    if (!deviceId) {
      deviceId = Crypto.randomUUID();
      localStorage.setItem('deviceId', deviceId);
    }

    return deviceId;
  }

  // 📱 Mobile (Android / iOS)
  try {

    let deviceId = await SecureStore.getItemAsync('deviceId');

    if (!deviceId) {
      deviceId = Crypto.randomUUID();
      await SecureStore.setItemAsync('deviceId', deviceId);
    }

    return deviceId;

  } catch (error) {
    console.error('Error generating deviceId:', error);
    throw error;
  }

};