import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle, TextStyle } from 'react-native';

export type SegmentedSwitchOption = {
  label: string;
  value: string;
};

interface SegmentedSwitchProps {
  options: SegmentedSwitchOption[];
  value: string;
  onChange: (value: string) => void;
  containerStyle?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  activeButtonStyle?: StyleProp<ViewStyle>;
  inactiveButtonStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  activeLabelStyle?: StyleProp<TextStyle>;
  inactiveLabelStyle?: StyleProp<TextStyle>;
}

export default function SegmentedSwitch({
  options,
  value,
  onChange,
  containerStyle,
  buttonStyle,
  activeButtonStyle,
  inactiveButtonStyle,
  labelStyle,
  activeLabelStyle,
  inactiveLabelStyle,
}: SegmentedSwitchProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.button,
              buttonStyle,
              isActive ? styles.activeButton : styles.inactiveButton,
              isActive ? activeButtonStyle : inactiveButtonStyle,
            ]}
          >
            <Text
              style={[
                styles.label,
                labelStyle,
                isActive ? styles.activeLabel : styles.inactiveLabel,
                isActive ? activeLabelStyle : inactiveLabelStyle,
              ]}
              numberOfLines={2}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 18,
    padding: 3,
    alignSelf: 'center',
    width: '92%',
    maxWidth: 360,
  },
  button: {
    flex: 1,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    minHeight: 44,
  },
  activeButton: {
    backgroundColor: '#fff',
  },
  inactiveButton: {
    backgroundColor: 'transparent',
  },
  label: {
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
    flexShrink: 1,
  },
  activeLabel: {
    color: '#15803D',
  },
  inactiveLabel: {
    color: '#4B5563',
  },
});
