import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

interface SearchFilterBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
}

/**
 * Search input + filter icon button, shared across Invoice, Credit,
 * and any other list screen that needs the same search pattern.
 */
export default function SearchFilterBar({
  value,
  onChangeText,
  placeholder = 'Search "Random kaka"',
  onFilterPress,
}: SearchFilterBarProps) {
  return (
    <View style={{ flexDirection: "row", marginBottom: 20 }}>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#FFFFFF",
          borderWidth: 1,
          borderColor: "#E5E7EB",
          borderRadius: 12,
          paddingHorizontal: 12,
        }}
      >
        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          style={{ flex: 1, paddingVertical: 12, color: "#111827", fontSize: 14 }}
          placeholderTextColor="#9CA3AF"
        />
        <Feather name="search" size={18} color="#9CA3AF" />
      </View>

      <TouchableOpacity
        onPress={onFilterPress}
        style={{
          marginLeft: 12,
          backgroundColor: "#F0F5F1",
          paddingHorizontal: 14,
          borderRadius: 12,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Feather name="filter" size={20} color="#2E7D32" />
      </TouchableOpacity>
    </View>
  );
}
