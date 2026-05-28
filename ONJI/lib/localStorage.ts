import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const localStorage = {
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      window.localStorage.setItem(key, value);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  },

  async getItem(key: string) {
    if (Platform.OS === 'web') {
      return window.localStorage.getItem(key);
    } else {
      return await AsyncStorage.getItem(key);
    }
  },

  async removeItem(key: string) {
    if (Platform.OS === 'web') {
      window.localStorage.removeItem(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  },
};