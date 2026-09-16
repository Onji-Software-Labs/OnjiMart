import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";

export type ReliabilityLevel = "HIGH" | "MODERATE" | "AT_RISK" | "FIRST_TIME";

const RELIABILITY_STYLES: Record<
  ReliabilityLevel,
  { label: string; dotColor: string; textColor: string }
> = {
  HIGH: { label: "Reliability: HIGH", dotColor: "#2E7D32", textColor: "#2E7D32" },
  MODERATE: { label: "Reliability: MODERATE", dotColor: "#F59E0B", textColor: "#B45309" },
  AT_RISK: { label: "Reliability: At Risk", dotColor: "#DC2626", textColor: "#DC2626" },
  FIRST_TIME: { label: "First-Time", dotColor: "#9CA3AF", textColor: "#6B7280" },
};

export interface CreditItem {
  id: string;
  supplierName: string;
  avatarUri?: any;
  address?: string; // shown on "request" variant cards
  reliability: ReliabilityLevel;
  overdue?: boolean;
  totalOwed: string;
  lastPaidDate?: string;
  dueInDays?: number;
  repaymentProgress: number; // 0 to 1
  installmentsLabel?: string; // e.g. "6 installments in 12 months"
  creditsFulfilledLabel?: string; // e.g. "8/12 credits Fulfilled"
  hasExistingCredit?: boolean; // for "First-Time" cards -> show "View Existing Credit"
}

interface CreditCardProps {
  item: CreditItem;
  variant: "ongoing" | "request";
  onNudge?: (item: CreditItem) => void;
  onDetails?: (item: CreditItem) => void;
  onCall?: (item: CreditItem) => void;
  onAccept?: (item: CreditItem) => void;
  onDecline?: (item: CreditItem) => void;
  onViewExisting?: (item: CreditItem) => void;
}

const PLACEHOLDER_AVATAR = require("../../assets/images/3davatar.png");

/**
 * Supplier credit card used on the Credit screen.
 * variant="ongoing"  -> shows Nudge / Details / Call actions
 * variant="request"  -> shows Accept / Decline, or "View Existing Credit"
 *                       when the supplier is a first-time applicant.
 */
export default function CreditCard({
  item,
  variant,
  onNudge,
  onDetails,
  onCall,
  onAccept,
  onDecline,
  onViewExisting,
}: CreditCardProps) {
  const reliability = RELIABILITY_STYLES[item.reliability];

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
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <Image
          source={item.avatarUri ?? PLACEHOLDER_AVATAR}
          style={{ width: 44, height: 44, borderRadius: 22, marginRight: 12 }}
        />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}>
              {item.supplierName}
            </Text>
            {item.overdue && (
              <View
                style={{
                  backgroundColor: "#FEE2E2",
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "#DC2626", fontSize: 10, fontWeight: "700" }}>
                  OVERDUE
                </Text>
              </View>
            )}
          </View>

          {item.address ? (
            <Text style={{ fontSize: 11.5, color: "#6B7280", marginTop: 2 }}>
              {item.address}
            </Text>
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 }}>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: reliability.dotColor,
                }}
              />
              <Text style={{ fontSize: 12, color: reliability.textColor, fontWeight: "600" }}>
                {reliability.label}
              </Text>
              {item.dueInDays != null && (
                <Text style={{ fontSize: 11, color: "#DC2626", marginLeft: 6 }}>
                  Due in {item.dueInDays} Days
                </Text>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Owed amount + last paid / repayment score */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginTop: 14,
        }}
      >
        <View>
          <Text style={{ fontSize: 11, color: "#6B7280" }}>Total Owed</Text>
          <Text style={{ fontSize: 22, fontWeight: "700", color: "#2E7D32" }}>
            {item.totalOwed}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          {variant === "request" ? (
            <>
              <Text style={{ fontSize: 11, color: "#6B7280" }}>Repayment Score</Text>
              <Text style={{ fontSize: 13, fontWeight: "700", color: reliability.textColor }}>
                {item.reliability === "FIRST_TIME" ? "First-Time" : "HIGH"}
              </Text>
            </>
          ) : (
            item.lastPaidDate && (
              <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
                Last Paid: {item.lastPaidDate}
              </Text>
            )
          )}
        </View>
      </View>

      {/* Repayment progress bar */}
      {item.reliability !== "FIRST_TIME" && (
        <View style={{ marginTop: 12 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
            <Text style={{ fontSize: 10.5, color: "#6B7280" }}>Repayment Progress</Text>
            <Text style={{ fontSize: 10.5, color: "#111827", fontWeight: "600" }}>
              {Math.round(item.repaymentProgress * 100)}%
            </Text>
          </View>
          <View
            style={{ height: 6, borderRadius: 3, backgroundColor: "#E5E7EB", overflow: "hidden" }}
          >
            <View
              style={{
                height: "100%",
                width: `${item.repaymentProgress * 100}%`,
                backgroundColor: "#2E7D32",
                borderRadius: 3,
              }}
            />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
            {item.installmentsLabel && (
              <Text style={{ fontSize: 10, color: "#9CA3AF" }}>{item.installmentsLabel}</Text>
            )}
            {item.creditsFulfilledLabel && (
              <Text style={{ fontSize: 10, color: "#9CA3AF" }}>{item.creditsFulfilledLabel}</Text>
            )}
          </View>
        </View>
      )}

      {item.reliability === "FIRST_TIME" && (
        <Text style={{ fontSize: 11, color: "#9CA3AF", marginTop: 10 }}>No Credits Taken</Text>
      )}

      {/* Actions */}
      <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
        {variant === "ongoing" && (
          <>
            <TouchableOpacity
              onPress={() => onNudge?.(item)}
              style={{
                flex: 1,
                backgroundColor: "#2E7D32",
                paddingVertical: 11,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>Nudge</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onDetails?.(item)}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: "#2E7D32",
                paddingVertical: 11,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#2E7D32", fontWeight: "700", fontSize: 13 }}>Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onCall?.(item)}
              style={{
                width: 42,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="call-outline" size={16} color="#2E7D32" />
            </TouchableOpacity>
          </>
        )}

        {variant === "request" && item.reliability !== "FIRST_TIME" && (
          <>
            <TouchableOpacity
              onPress={() => onAccept?.(item)}
              style={{
                flex: 1,
                backgroundColor: "#2E7D32",
                paddingVertical: 11,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onDecline?.(item)}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: "#D1D5DB",
                paddingVertical: 11,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#6B7280", fontWeight: "700", fontSize: 13 }}>Decline</Text>
            </TouchableOpacity>
          </>
        )}

        {variant === "request" && item.reliability === "FIRST_TIME" && (
          <TouchableOpacity
            onPress={() => onViewExisting?.(item)}
            style={{
              flex: 1,
              backgroundColor: "#EAF4EC",
              paddingVertical: 11,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#2E7D32", fontWeight: "700", fontSize: 13 }}>
              View Existing Credit
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
