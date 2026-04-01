import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export default function InvoiceSummary() {
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>

      {/* HEADER */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          borderBottomWidth: 1,
          borderColor: "#eee",
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#2E7D32" />
        </TouchableOpacity>

        <Text
          style={{
            marginLeft: 10,
            fontSize: 18,
            fontWeight: "600",
            color: "#2E7D32",
          }}
        >
          Invoice Summary
        </Text>
      </View>

      {/* INVOICE INFO */}
      <View style={{ padding: 16 }}>
        <Text style={{ fontWeight: "700", fontSize: 16 }}>
          INV-78901
        </Text>

        <Text style={{ color: "#6B7280", marginTop: 4 }}>
          Generated: 12 Aug, 2025
        </Text>

        {/* Approved badge */}
        <View
          style={{
            backgroundColor: "#E6F4EA",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 10,
            alignSelf: "flex-start",
            marginTop: 8,
          }}
        >
          <Text style={{ color: "#2E7D32", fontWeight: "600" }}>
            Approved
          </Text>
        </View>
      </View>

      {/* SUPPLIER */}
      <View
        style={{
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: "#eee",
          padding: 16,
        }}
      >
        <Text style={{ color: "#6B7280", marginBottom: 4 }}>
          Supplier
        </Text>

        <Text style={{ fontWeight: "600" }}>
          Sunways trading
        </Text>

        <Text style={{ color: "#6B7280" }}>
          Supplier ID: #4521
        </Text>
      </View>

      {/* EMPTY CART */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Feather name="shopping-cart" size={40} color="#D1D5DB" />

        <Text
          style={{
            marginTop: 16,
            fontSize: 16,
            fontWeight: "600",
            color: "#9CA3AF",
          }}
        >
          Looks like your cart’s empty.
        </Text>

        <Text
          style={{
            marginTop: 4,
            fontSize: 13,
            color: "#D1D5DB",
          }}
        >
          Browse suppliers and add items you love.
        </Text>
      </View>
    </View>
  );
}