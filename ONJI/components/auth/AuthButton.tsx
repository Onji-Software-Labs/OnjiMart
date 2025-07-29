import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
}

export default function AuthButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  containerStyle,
  textStyle,
}: AuthButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        styles.button,
        disabled ? styles.buttonDisabled : styles.buttonEnabled,
        containerStyle,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <Text
        style={[
          styles.text,
          disabled ? styles.textDisabled : styles.textEnabled,
          textStyle,
        ]}
      >
        {loading ? 'Please wait...' : title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonEnabled: {
    backgroundColor: '#4CAF50',
  },
  buttonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  textEnabled: {
    color: '#FFFFFF',
  },
  textDisabled: {
    color: '#9E9E9E',
  },
});
