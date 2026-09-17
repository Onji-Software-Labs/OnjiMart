import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import SearchFilterBar from "@/components/SearchFilterBar";
import CreditHistoryItem, { CreditHistoryEvent } from "@/components/credit/CreditHistoryItem";

const PLACEHOLDER_AVATAR = require("@/assets/images/3davatar.png");
// ─────────────────────────────────────────────────────────────
// MOCK DATA — replace with a real fetch using params.creditId
// ─────────────────────────────────────────────────────────────

const SUPPLIER = {
  name: "Harvest Ledger Sourcing",
  reliability: "HIGH",
  address: "42 Market Street, Organic District, New Delhi 110001",
};

const CREDIT_SUMMARY = {
  totalCreditsFixed: 24,
  creditsFilled: "23/24",
  totalOwed: "$15200",
  dueInDays: 13,
  lastPaidDate: "Oct 24, 2023",
  repaymentProgress: 0.65,
  installmentsLabel: "6 installments in 12 months",
  historicalSpeedScore: "4.8/5.0",
  historicalSpeedNote:
    "Nudif Legit is consistently settles balances 2 days ahead of schedule. They are currently on our 'Top Tier' credit reward.",
};

const HISTORY: CreditHistoryEvent[] = [
  {
    id: "1",
    type: "credit",
    title: "Partial Repayment Received",
    subtitle: "Automated settlement via OnjiPay Wallet.",
    amount: "+$5,000.00",
    date: "Sep 28, 2023 • 14:32",
    tag: "Credited",
  },
  {
    id: "2",
    type: "debit",
    title: "Inventory Financing: Fresh Produce",
    subtitle: "Bulk procurement of organic apples and berries.",
    amount: "-$2,200.00",
    date: "Sep 28, 2023 • 14:32",
    tag: "Debited",
  },
  {
    id: "3",
    type: "nudge",
    title: "System Nudge sent",
    subtitle: "Bulk procurement of organic apples and berries.",
    date: "Sep 28, 2023 • 14:32",
    tag: "Reminder",
  },
  {
    id: "4",
    type: "credit",
    title: "Monthly Installment",
    subtitle: "Previous cycle full settlement.",
    amount: "+$12,400.00",
    date: "Aug 15, 2023 • 10:45",
  },
  {
    id: "5",
    type: "credit",
    title: "Monthly Installment",
    subtitle: "Previous cycle full settlement.",
    amount: "+$5,000.00",
    date: "",
  },
];

// ─────────────────────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────────────────────

export default function CreditDetailsScreen() {
  const router = useRouter();
  const { creditId } = useLocalSearchParams<{ creditId?: string }>();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* HEADER */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: 40,
          paddingBottom: 10,
          gap: 10,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#2E7D32" }}>Credit Details</Text>
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: "#F9FAFB" }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* SUPPLIER HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <View>
            <Image
              source={PLACEHOLDER_AVATAR}
              style={{ width: 52, height: 52, borderRadius: 26 }}
            />
            {/* two small identity badges, as shown in the design */}
            <View
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: "#DB2777",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 2,
                borderColor: "#fff",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>M</Text>
            </View>
            <View
              style={{
                position: "absolute",
                bottom: -4,
                right: -10,
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: "#2563EB",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 2,
                borderColor: "#fff",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>A</Text>
            </View>
          </View>

          <View style={{ marginLeft: 14, flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>
              {SUPPLIER.name}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
              <View
                style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#2E7D32" }}
              />
              <Text style={{ fontSize: 12, color: "#2E7D32", fontWeight: "600" }}>
                Reliability: {SUPPLIER.reliability}
              </Text>
            </View>
          </View>
        </View>

        {/* ADDRESS */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#fff",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#F0F0F0",
            padding: 10,
            marginBottom: 12,
            gap: 6,
          }}
        >
          <Ionicons name="location-outline" size={14} color="#6B7280" />
          <Text style={{ fontSize: 12, color: "#374151", flex: 1 }}>{SUPPLIER.address}</Text>
        </View>

        {/* CONTACT ACTIONS */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 18 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#EAF4EC",
              paddingVertical: 12,
              borderRadius: 12,
              gap: 6,
            }}
          >
            <Feather name="message-square" size={16} color="#2E7D32" />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#EAF4EC",
              paddingVertical: 12,
              borderRadius: 12,
              gap: 6,
            }}
          >
            <Ionicons name="call-outline" size={16} color="#2E7D32" />
          </TouchableOpacity>
        </View>

        {/* TOTAL CREDITS FIXED / CREDITS FILLED */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: "#2E7D32",
              borderRadius: 12,
              padding: 12,
            }}
          >
            <Text style={{ color: "#D9EDDB", fontSize: 11 }}>Total Credits Fixed</Text>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>
              {CREDIT_SUMMARY.totalCreditsFixed}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: "#2E7D32",
              borderRadius: 12,
              padding: 12,
            }}
          >
            <Text style={{ color: "#D9EDDB", fontSize: 11 }}>Credits Filled</Text>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>
              {CREDIT_SUMMARY.creditsFilled}
            </Text>
          </View>
        </View>

        {/* CREDIT SUMMARY CARD */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#F0F0F0",
            padding: 16,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827", marginBottom: 10 }}>
            Credit Summary
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View>
              <Text style={{ fontSize: 11, color: "#6B7280" }}>Total Owed</Text>
              <Text style={{ fontSize: 22, fontWeight: "700", color: "#2E7D32" }}>
                {CREDIT_SUMMARY.totalOwed}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontSize: 11, color: "#DC2626" }}>
                Due in {CREDIT_SUMMARY.dueInDays} Days
              </Text>
              <Text style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
                Last Paid: {CREDIT_SUMMARY.lastPaidDate}
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 14 }}>
            <View
              style={{ height: 6, borderRadius: 3, backgroundColor: "#E5E7EB", overflow: "hidden" }}
            >
              <View
                style={{
                  height: "100%",
                  width: `${CREDIT_SUMMARY.repaymentProgress * 100}%`,
                  backgroundColor: "#2E7D32",
                  borderRadius: 3,
                }}
              />
            </View>
            <Text style={{ fontSize: 10, color: "#9CA3AF", marginTop: 4 }}>
              {CREDIT_SUMMARY.installmentsLabel}
            </Text>
          </View>
        </View>

        {/* HISTORICAL SPEED */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#F0F0F0",
            padding: 16,
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }}>
              Historical Speed
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <MaterialCommunityIcons name="star" size={14} color="#F59E0B" />
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }}>
                {CREDIT_SUMMARY.historicalSpeedScore}
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 11.5, color: "#6B7280", marginTop: 6, lineHeight: 16 }}>
            {CREDIT_SUMMARY.historicalSpeedNote}
          </Text>
        </View>

        {/* CREDIT HISTORY */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}>Credit History</Text>
          <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Feather name="download" size={13} color="#2E7D32" />
            <Text style={{ fontSize: 12, color: "#2E7D32", fontWeight: "600" }}>
              Download Report
            </Text>
          </TouchableOpacity>
        </View>

        <SearchFilterBar value={searchQuery} onChangeText={setSearchQuery} />

        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#F0F0F0",
            paddingHorizontal: 14,
            marginBottom: 20,
          }}
        >
          {HISTORY.map((event) => (
            <CreditHistoryItem key={event.id} event={event} />
          ))}
        </View>

        {/* NUDGE CTA */}
        <TouchableOpacity
          style={{
            backgroundColor: "#2E7D32",
            paddingVertical: 15,
            borderRadius: 14,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <MaterialCommunityIcons name="hand-wave-outline" size={18} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Nudge</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
