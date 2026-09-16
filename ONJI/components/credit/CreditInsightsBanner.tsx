import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface CreditInsightsBannerProps {
  message?: string;
  onExplorePress?: () => void;
}

/**
 * "Credit Reliability Insights" banner shown below the summary card,
 * nudging the retailer toward the analytics view.
 */
export default function CreditInsightsBanner({
  message = "Our AI-driven model suggests 85% of your high-risk accounts benefit within 7 days of the first nudge. Automate follow-ups to save 12 hours weekly.",
  onExplorePress,
}: CreditInsightsBannerProps) {
  return (
    <View
      style={{
        backgroundColor: "#F5F1DE",
        borderRadius: 14,
        padding: 14,
        marginBottom: 16,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <MaterialCommunityIcons name="lightbulb-on-outline" size={16} color="#8A6D1D" />
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#5C4A14" }}>
            Credit Reliability Insights
          </Text>
        </View>
        <TouchableOpacity onPress={onExplorePress}>
          <View
            style={{
              backgroundColor: "#2E7D32",
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 11, fontWeight: "600" }}>
              Explore Analytics
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      <Text style={{ fontSize: 11.5, color: "#6B5D2E", lineHeight: 16 }}>{message}</Text>
    </View>
  );
}
