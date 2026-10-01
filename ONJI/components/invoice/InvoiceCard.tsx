import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Share } from "react-native";
import { Feather } from "@expo/vector-icons";

const PLACEHOLDER_AVATAR = require("../../assets/images/3davatar.png");

export interface InvoiceItem {
  id: number;
  supplier: string;
  invoiceCount: number;
  status: string;
  date: string;
  time: string;
  orderId: string;
  amount: string;
  expanded?: boolean;
}

interface InvoiceCardProps {
  item: InvoiceItem;
  onViewDetails?: (item: InvoiceItem) => void;
}

/**
 * A single invoice card, with an expandable "previous invoices" section.
 * Extracted from the Invoice screen so it can be reused / tested in isolation.
 */
export default function InvoiceCard({ item, onViewDetails }: InvoiceCardProps) {
  const [isExpanded, setIsExpanded] = useState(item.expanded ?? false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Invoice from ${item.supplier} for ${item.amount}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#F3F4F6",
      }}
    >
      {/* Header row */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image source={PLACEHOLDER_AVATAR} style={{ width: 44, height: 44, borderRadius: 22 }} />
          <View style={{ marginLeft: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}>
              {item.supplier}
            </Text>
            <View
              style={{
                backgroundColor: "#F3F4F6",
                alignSelf: "flex-start",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
                marginTop: 4,
              }}
            >
              <Text style={{ fontSize: 11, color: "#6B7280", fontWeight: "500" }}>
                {item.invoiceCount} Invoices
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} style={{ padding: 4 }}>
          <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Status & date row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#2E7D32", marginRight: 6 }} />
          <Text style={{ fontSize: 12, color: "#6B7280", fontWeight: "500" }}>{item.status}</Text>
        </View>
        <Text style={{ fontSize: 11, color: "#6B7280" }}>
          {item.date} • {item.time}
        </Text>
      </View>

      {/* Order info row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginTop: 12,
        }}
      >
        <View>
          <Text style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>Latest Order Id</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#111827", marginRight: 6 }}>
              {item.orderId}
            </Text>
            <Feather name="copy" size={14} color="#2E7D32" />
          </View>
        </View>
        <Text style={{ fontSize: 20, fontWeight: "700", color: "#2E7D32" }}>{item.amount}</Text>
      </View>

      {/* Action buttons row */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16 }}>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            style={{
              padding: 10,
              backgroundColor: "#F9FAFB",
              borderRadius: 8,
              marginRight: 8,
              borderWidth: 1,
              borderColor: "#F3F4F6",
            }}
          >
            <Feather name="download" size={16} color="#4B5563" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShare}
            style={{
              padding: 10,
              backgroundColor: "#F9FAFB",
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#F3F4F6",
            }}
          >
            <Feather name="share-2" size={16} color="#4B5563" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => onViewDetails?.(item)}
          style={{
            backgroundColor: "#4C8A5A",
            paddingHorizontal: 24,
            paddingVertical: 10,
            borderRadius: 8,
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>Invoice Details</Text>
        </TouchableOpacity>
      </View>

      {/* Expanded: previous invoices */}
      {isExpanded && (
        <View
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: "#E5E7EB",
            borderStyle: "dashed",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Feather name="rotate-ccw" size={14} color="#2E7D32" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 12, color: "#4B5563", fontWeight: "500" }}>
                +2 previous invoices
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: "#2E7D32", fontWeight: "600" }}>View all</Text>
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
            {[1, 2, 3, 4].map((_, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: "row",
                  width: "48%",
                  backgroundColor: "#F9FAFB",
                  borderRadius: 12,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: "#F3F4F6",
                  overflow: "hidden",
                }}
              >
                <View style={{ padding: 10, flex: 1 }}>
                  <Text style={{ fontSize: 8, color: "#6B7280" }}>
                    {item.date} • {item.time}
                  </Text>
                  <Text style={{ fontSize: 9, color: "#6B7280", marginTop: 4 }}>
                    Order Id <Text style={{ fontWeight: "600", color: "#111827" }}>{item.orderId}</Text>
                  </Text>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827", marginTop: 6 }}>
                    {item.amount}
                  </Text>
                </View>
                <View
                  style={{
                    width: 24,
                    backgroundColor: idx === 0 ? "#4C8A5A" : "transparent",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Feather name="chevron-right" size={14} color={idx === 0 ? "#fff" : "#9CA3AF"} />
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
