import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

/**
 * Returns a stable unique deviceId per app installation.
 * - Generated once (UUID v4)
 * - Stored securely in SecureStore (Keychain / Keystore)
 */
export const getDeviceId = async () => {
    // 🌐 Web → backend controls deviceId via cookie
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    let deviceId = await SecureStore.getItemAsync('deviceId');

    if (!deviceId) {
      deviceId = uuidv4();
      await SecureStore.setItemAsync('deviceId', deviceId);
    }

    return deviceId;
  } catch (error) {
    console.error('Error generating deviceId:', error);
    throw error;
  }
};