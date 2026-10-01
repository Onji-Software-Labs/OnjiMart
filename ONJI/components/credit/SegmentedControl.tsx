import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface SegmentedControlProps {
  options: string[];
  activeOption: string;
  onChange: (option: string) => void;
}

/**
 * Generic 2+ option segmented control, used for:
 * - the top "Invoice / Credit" navigation toggle
 * - the "New Requests / Ongoing Credit" sub-tabs on the Credit screen
 */
export default function SegmentedControl({
  options,
  activeOption,
  onChange,
}: SegmentedControlProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: "#E5E7EB",
        padding: 4,
        borderRadius: 12,
      }}
    >
      {options.map((option) => {
        const isActive = option === activeOption;
        return (
          <TouchableOpacity
            key={option}
            onPress={() => onChange(option)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 8,
              alignItems: "center",
              backgroundColor: isActive ? "#FFFFFF" : "transparent",
              ...(isActive
                ? {
                    shadowColor: "#000",
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 2,
                  }
                : {}),
            }}
          >
            <Text
              style={{
                color: isActive ? "#2E7D32" : "#6B7280",
                fontWeight: isActive ? "600" : "500",
              }}
            >
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
