import React from "react";
import { Text, View } from "react-native";

type Props = {
  placedDate: string;
  placedTime: string;
  approvedDate?: string;
  approvedTime?: string;
};

const LABEL_WIDTH = 76; // wide enough for the bold "Approved"

const Row = ({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) => (
  <View style={{ flexDirection: "row", alignItems: "center" }}>
    <Text
      style={{
        width: LABEL_WIDTH,
        fontSize: 12,
        color: strong ? "#15803D" : "#9CA3AF",
        fontWeight: strong ? "700" : "400",
      }}
    >
      {label}
    </Text>
    <Text
      style={{
        fontSize: 12,
        color: strong ? "#166534" : "#6B7280",
        fontWeight: strong ? "600" : "400",
      }}
    >
      {value}
    </Text>
  </View>
);

export function OrderDates({
  placedDate,
  placedTime,
  approvedDate,
  approvedTime,
}: Props) {
  return (
    <View
      style={{
        backgroundColor: "#F9FAFB",
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginTop: 12,
        gap: 8,
      }}
    >
      {approvedDate && (
        <Row
          label="Approved"
          value={`${approvedDate} • ${approvedTime}`}
          strong
        />
      )}
      <Row label="Placed" value={`${placedDate} • ${placedTime}`} />
    </View>
  );
}