import React from "react";
import { View, Text } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

export type HistoryEventType = "credit" | "debit" | "nudge";

export interface CreditHistoryEvent {
  id: string;
  type: HistoryEventType;
  title: string;
  subtitle: string;
  amount?: string; // e.g. "+$5,000.00" or "-$2,200.00"
  date: string;
  tag?: string; // e.g. "Reminder"
}

const EVENT_ICON: Record<HistoryEventType, { name: any; bg: string; color: string }> = {
  credit: { name: "check", bg: "#DCFCE7", color: "#15803D" },
  debit: { name: "arrow-down", bg: "#DBEAFE", color: "#1D4ED8" },
  nudge: { name: "bell", bg: "#FEF3C7", color: "#B45309" },
};

/**
 * A single row in the "Credit History" timeline on the Credit Details screen.
 */
export default function CreditHistoryItem({ event }: { event: CreditHistoryEvent }) {
  const icon = EVENT_ICON[event.type];
  const amountColor = event.amount?.startsWith("-") ? "#DC2626" : "#15803D";

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
      }}
    >
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: icon.bg,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        <Feather name={icon.name} size={14} color={icon.color} />
      </View>

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }}>
            {event.title}
          </Text>
          {event.amount && (
            <Text style={{ fontSize: 13, fontWeight: "700", color: amountColor }}>
              {event.amount}
            </Text>
          )}
        </View>
        <Text style={{ fontSize: 11.5, color: "#6B7280", marginTop: 2 }}>{event.subtitle}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4, gap: 6 }}>
          <Text style={{ fontSize: 10.5, color: "#9CA3AF" }}>{event.date}</Text>
          {event.tag && (
            <View
              style={{
                backgroundColor: "#F3F4F6",
                paddingHorizontal: 6,
                paddingVertical: 1,
                borderRadius: 6,
              }}
            >
              <Text style={{ fontSize: 9.5, color: "#6B7280" }}>{event.tag}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
