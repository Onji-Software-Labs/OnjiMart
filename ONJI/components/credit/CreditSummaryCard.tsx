import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

interface CreditSummaryCardProps {
  totalCreditAvailable: string;
  utilizationRate: string;
  activeAccounts: number;
  outstandingTotal: string;
  upcomingPayments: number;
  priorityLabel?: string;
  period?: string;
  onPeriodPress?: () => void;
}

/**
 * The big green "Total Credit Available" summary card shown at the
 * top of the Credit screen (Finance > Credit tab).
 */
export default function CreditSummaryCard({
  totalCreditAvailable,
  utilizationRate,
  activeAccounts,
  outstandingTotal,
  upcomingPayments,
  priorityLabel = "Priority",
  period = "Monthly",
  onPeriodPress,
}: CreditSummaryCardProps) {
  return (
    <View
      style={{
        backgroundColor: "#2E7D32",
        borderRadius: 18,
        padding: 18,
        marginBottom: 14,
      }}
    >
      {/* Header row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 4,
        }}
      >
        <Text style={{ color: "#D9EDDB", fontSize: 13, fontWeight: "500" }}>
          Total Credit Available
        </Text>
        <TouchableOpacity
          onPress={onPeriodPress}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.15)",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 8,
            gap: 4,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 11, fontWeight: "600" }}>{period}</Text>
          <Feather name="chevron-down" size={12} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={{ color: "#fff", fontSize: 30, fontWeight: "700", marginBottom: 16 }}>
        {totalCreditAvailable}
      </Text>

      {/* Metrics grid */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        <MetricBlock label="Utilization Rate" value={utilizationRate} />
        <MetricBlock label="Active accounts" value={String(activeAccounts)} />
        <MetricBlock label="Outstanding Total" value={outstandingTotal} />
        <MetricBlock
          label="Upcoming Payments"
          value={String(upcomingPayments)}
          badge={priorityLabel}
        />
      </View>
    </View>
  );
}

function MetricBlock({
  label,
  value,
  badge,
}: {
  label: string;
  value: string;
  badge?: string;
}) {
  return (
    <View
      style={{
        width: "47%",
        backgroundColor: "rgba(255,255,255,0.12)",
        borderRadius: 12,
        padding: 10,
      }}
    >
      <Text style={{ color: "#D9EDDB", fontSize: 11 }}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
        <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>{value}</Text>
        {badge && (
          <View
            style={{
              backgroundColor: "#F59E0B",
              paddingHorizontal: 6,
              paddingVertical: 1,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 9, fontWeight: "700" }}>{badge}</Text>
          </View>
        )}
      </View>
    </View>
  );
}
