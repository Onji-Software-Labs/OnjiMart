import React, { useRef } from 'react';
import { View, TextInput, StyleSheet, ViewStyle } from 'react-native';

interface OTPInputProps {
  length?: number;
  value: string[];
  onChange: (value: string[]) => void;
  containerStyle?: ViewStyle;
  inputRefs?: React.MutableRefObject<TextInput[]>;
  isError?: boolean;
}

export default function OTPInput({
  length = 6,
  value,
  onChange,
  containerStyle,
  inputRefs,
  isError = false,
}: OTPInputProps) {
  const refs = inputRefs || useRef<TextInput[]>([]);

  const handleChange = (val: string, index: number) => {
    if (val.length > 1) return;
    const newVal = [...value];
    newVal[index] = val;
    onChange(newVal);
    if (val && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !value[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {Array.from({ length }).map((_, idx) => (
        <TextInput
          key={idx}
          ref={(ref) => {
            if (ref) refs.current[idx] = ref;
          }}
          style={[
            styles.input,
            isError && styles.inputError,
            value[idx] && styles.inputFilled,
          ]}
          value={value[idx]}
          onChangeText={(v) => handleChange(v, idx)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, idx)}
          keyboardType="numeric"
          maxLength={1}
          selectTextOnFocus
          textAlign="center"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    fontSize: 20,
    fontWeight: '600',
    backgroundColor: '#fff',
    color: '#333',
  },
  inputFilled: {
    borderColor: '#4CAF50',
  },
  inputError: {
    borderColor: '#FF5252',
  },
});

