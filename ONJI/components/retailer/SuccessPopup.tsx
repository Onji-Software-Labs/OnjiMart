import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type SuccessPopupProps = {
  visible: boolean;
  supplierName: string;
  onViewOrderDetail: () => void;
  onCheckNotifications: () => void;
};

/** Confirmation shown after a retailer's order request is submitted. */
export default function SuccessPopup({
  visible,
  supplierName,
  onViewOrderDetail,
  onCheckNotifications,
}: SuccessPopupProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.checkmark}>
            <Ionicons name="checkmark" size={35} color="#FFFFFF" />
          </View>

          <Text style={styles.title}>
            Your order request has been sent{"\n"}
            to {supplierName}.
          </Text>

          <Text style={styles.description}>
            You will be notified once it is approved. You{"\n"}
            can also track it in the Orders section
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onViewOrderDetail}
              style={[styles.button, styles.primaryButton]}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>View Order Detail</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onCheckNotifications}
              style={[styles.button, styles.secondaryButton]}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryButtonText}>Check Notifications</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.14)",
    paddingHorizontal: 13,
  },
  card: {
    width: "100%",
    maxWidth: 390,
    backgroundColor: "#FFFFFF",
    borderRadius: 9,
    paddingTop: 42,
    paddingHorizontal: 13,
    paddingBottom: 13,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  checkmark: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#24B768",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    color: "#33914D",
    fontSize: 13,
    lineHeight: 15,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 13,
  },
  description: {
    color: "#5C5C5C",
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 20,
  },
  actions: {
    width: "100%",
    flexDirection: "row",
    gap: 5,
  },
  button: {
    flex: 1,
    minHeight: 27,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  primaryButton: { backgroundColor: "#278C3C" },
  secondaryButton: { backgroundColor: "#E5F1E8" },
  primaryButtonText: { color: "#FFFFFF", fontSize: 9, fontWeight: "600" },
  secondaryButtonText: { color: "#161616", fontSize: 9, fontWeight: "600" },
});
