import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  Switch,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import axiosInstance from "@/lib/api/axiosConfig";
import { editOrder, markOrderAsProcessing } from "@/lib/api/order";
import { getInvoiceByOrderId } from "@/lib/api/invoice";

const AVATAR = require("../../assets/images/3davatar.png");

export default function OrderDetails() {
  const { orderId } = useLocalSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
const [hasEditedOrder, setHasEditedOrder] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showEditedOrder, setShowEditedOrder] = useState(false);
  const disableActions = hasEditedOrder && !showEditedOrder;

  const [items, setItems] = useState<any[]>([]);
  const [originalItems, setOriginalItems] = useState<any[]>([]);

const isFulfilled = ["COMPLETED", "APPROVED", "DELIVERED"].includes(order?.status);

  const fetchOrderDetails = async () => {
    try {
      const res = await axiosInstance.get(`/api/orders/${orderId}`);
      setOrder(res.data);

      const edited = res.data.items.some((item: any) => item.edited);
      setHasEditedOrder(edited);
      if (!edited) setShowEditedOrder(false);

      setItems(
        res.data.items.map((item: any) => ({
          id: item.id,
          name: item.productName,
          requestedQuantity: String(item.requestedQuantity),
          fulfilledQuantity: String(
            item.edited ? item.fulfilledQuantity : item.requestedQuantity
          ),
          price: String(item.unitPrice),
          availableQuantity: item.availableQuantity,
          emoji: "📦",
        }))
      );
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (order?.status === "NEW") {
      markOrderAsProcessing(order.id).catch((err) =>
        console.log("Failed to mark as processing:", err)
      );
    }
  }, [order?.id]);

useFocusEffect(
  useCallback(() => {
    if (orderId) fetchOrderDetails();
  }, [orderId])
);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  const oldSubtotal = order.items.reduce(
    (sum: number, item: any) => sum + item.requestedQuantity * item.unitPrice,
    0
  );

  const editedSubtotal = order.items.reduce(
    (sum: number, item: any) => sum + item.fulfilledQuantity * item.unitPrice,
    0
  );

  const totalOrderItems = items.reduce(
    (sum: number, item: any) =>
      sum +
      Number(showEditedOrder ? item.fulfilledQuantity : item.requestedQuantity),
    0
  );

  const subtotal = showEditedOrder ? editedSubtotal : oldSubtotal;
  const tax = subtotal * 0.05;
  const grandTotal = subtotal + tax;
  const deliveryCharge = order?.deliveryCharge ?? 0;
  const orderDate = order?.orderDate ? new Date(order.orderDate) : null;

  const formattedDate = orderDate
    ? orderDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "-";

  const formattedTime = orderDate
    ? orderDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "-";

  const formattedDelivery = order?.deliveryDate
    ? new Date(order.deliveryDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "-";

  const handleFulfillOrder = () => {
    router.push({
      pathname: "./orderConfirm",
      params: { orderId: order.id },
    });
  };


const handleViewInvoice = async () => {
  const inv = await getInvoiceByOrderId(order.id);
  if (!inv) {
    Alert.alert("Invoice not found", "No invoice exists for this order yet.");
    return;
  }
  router.push({
    pathname: "/invoiceDetails",
    params: { invoiceId: inv.id, retailerName: order.retailerName || order.shopName },
  });
};

// const handleFulfillOrder = () => {
//   if (isFulfilled) return; // safety net
//   router.push({ pathname: "./orderConfirm", params: { orderId: order.id } });
// };

  const handleEditOrder = async () => {
    try {
      const payload = order.items.map((orderItem: any) => {
        const editedItem = items.find((i) => i.id === orderItem.id);
        return {
          itemId: orderItem.id,
          fulfilledQuantity: Number(
            editedItem?.fulfilledQuantity ?? orderItem.fulfilledQuantity
          ),
          unitPrice: Number(editedItem?.price ?? orderItem.unitPrice),
        };
      });

      await editOrder(orderId as string, payload);
      await fetchOrderDetails();

      setHasEditedOrder(true);
      setShowEditedOrder(true);
      setIsEditing(false);
    } catch (error) {
      console.log("Edit Order Error:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F6F6F6" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.navigate("/(supplier)/(tabs)/cart")} style={styles.backBtn}>
              <Feather name="arrow-left" size={20} color="#2E7D32" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Order Details</Text>
          </View>

          {/* Order summary card */}
          <View style={styles.groupedCard}>
            <View style={styles.infoRow}>
              {/* Order ID */}
              <View style={styles.infoCol}>
                <View style={styles.infoLabelRow}>
                  <Text style={styles.infoLabel}>Order Id</Text>
                </View>
                <View style={styles.inlineRow}>
                  <Text style={styles.infoValue} numberOfLines={1}>
                    #{order?.id?.slice(0, 8).toUpperCase()}
                  </Text>
                  <Feather
                    name="copy"
                    size={12}
                    color={GREEN}
                    style={{ marginLeft: 4, marginBottom: 2 }}
                  />
                </View>
                <View style={styles.chip}>
                  <Text style={styles.chipText}>{totalOrderItems} items</Text>
                </View>
              </View>

              {/* Order placed */}
              <View style={styles.infoCol}>
                <View style={styles.infoLabelRow}>
                  <Feather name="calendar" size={13} color="#0C5217" />
                  <Text style={styles.infoLabel}>Order Placed</Text>
                </View>
                <Text style={styles.infoValue}>{formattedDate}</Text>
                <Text style={styles.infoSubvalue}>{formattedTime}</Text>
              </View>

              {/* Delivery */}
              <View style={styles.infoCol}>
                <View style={styles.infoLabelRow}>
                  <Feather name="truck" size={13} color="#0C5217" />
                  <Text style={styles.infoLabel}>Est. Delivery</Text>
                </View>
                <Text style={styles.infoValue}>{formattedDelivery}</Text>
                <Text style={styles.infoSubvalue}>
                  {order?.deliveryTimeSlot ?? "-"}
                </Text>
              </View>
            </View>
          </View>

          {/* Old / Edited toggle */}
          {hasEditedOrder && (
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Old Order</Text>
              <Switch
                value={showEditedOrder}
                onValueChange={(value) => {
                  setIsEditing(false);
                  setShowEditedOrder(value);
                }}
                trackColor={{ false: "#D1D5DB", true: "#22C55E" }}
                thumbColor="#FFFFFF"
              />
              <Text style={styles.toggleLabel}>Edited Order</Text>
            </View>
          )}

          {/* Retailer card */}
          <View style={styles.card}>
            <View style={styles.inlineRow}>
              <Image source={AVATAR} style={styles.avatar} resizeMode="cover" />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.retailerName}>
                  {order?.retailerName || order?.shopName}
                </Text>
                <View style={[styles.inlineRow, { marginTop: 6 }]}>
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>
                      {order?.retailerPhoneNumber ?? "-"}
                    </Text>
                  </View>
                  <View style={[styles.chip, { marginLeft: 8 }]}>
                    <Text style={styles.chipText}>Retailer</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Address */}
            <View style={styles.addressBox}>
              <Feather name="map-pin" size={16} color={GREEN} />
              <Text style={styles.addressText}>
                {order?.retailerAddress ?? "-"}
              </Text>
            </View>

            {/* Stats */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total order Items</Text>
              <Text style={styles.summaryValueBold}>{totalOrderItems}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Vendor ID</Text>
              <View style={styles.inlineRow}>
                <Text style={styles.summaryValueBold}>
                  {order?.retailerId
                    ? order.retailerId.slice(0, 8).toUpperCase()
                    : "-"}
                </Text>
                <Feather
                  name="copy"
                  size={12}
                  color={GREEN}
                  style={{ marginLeft: 5 }}
                />
              </View>
            </View>

            <View style={styles.dashedDivider} />

            {/* Price */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{subtotal.toLocaleString("en-IN")}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (GST 5%)</Text>
              <Text style={styles.summaryValue}>₹{tax.toLocaleString("en-IN")}</Text>
            </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                        <Text style={styles.summaryLabel}>Delivery Charge</Text>
              <Text style={styles.summaryValue}>₹{deliveryCharge.toLocaleString("en-IN")}</Text>
                      </View>
            <View style={[styles.summaryRow, styles.summaryRowTotal]}>
              <Text style={styles.summaryLabelTotal}>Grand Total</Text>
              <Text style={styles.summaryValueTotal}>
                ₹{grandTotal.toLocaleString("en-IN")}
              </Text>
            </View>
          </View>

          {/* Order items header */}
          <View style={styles.itemsHeaderRow}>
            <Text style={styles.sectionTitle}>
              {isEditing ? "Edit Item Details" : "Order Items"}
            </Text>

            {!isEditing && (
              <TouchableOpacity
                disabled={disableActions}
                onPress={() => {
                  if (disableActions) return;
                  setOriginalItems(items.map((item) => ({ ...item })));
                  setIsEditing(true);
                }}
                style={styles.inlineRow}
              >
                <Text
                  style={[
                    styles.editLink,
                    disableActions && { color: "#9CA3AF" },
                  ]}
                >
                  Edit order items
                </Text>
                <Feather
                  name="plus-circle"
                  size={16}
                  color={disableActions ? "#9CA3AF" : "#3B82F6"}
                />
              </TouchableOpacity>
            )}
          </View>

          {isEditing && (
            <Text style={styles.editHint}>
              Manage quantity and pricing for this specific delivery
            </Text>
          )}

          {/* Items */}
          <View style={styles.itemsCard}>
            {items.map((item, index) => {
              const qty = Number(
                showEditedOrder ? item.fulfilledQuantity : item.requestedQuantity
              );
              return (
                <View
                  key={item.id}
                  style={[
                    styles.itemRow,
                    index !== items.length - 1 && styles.itemRowDivider,
                  ]}
                >
                  <View style={styles.itemImage}>
                    <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                  </View>

                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>

                    {!isEditing ? (
                      <>
                        <Text style={styles.itemMeta}>
                          {qty} kg × ₹{item.price}/kg
                        </Text>

                        {item.availableQuantity < qty && (
                          <Text style={styles.stockError}>
                            {item.availableQuantity === 0
                              ? "Out of stock."
                              : `Only : ${item.availableQuantity} kg available.`}
                          </Text>
                        )}
                      </>
                    ) : (
                      <View style={styles.editInputsRow}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                          <Text style={styles.inputLabel}>Price per kg</Text>
                          <TextInput
                            value={item.price}
                            keyboardType="numeric"
                            onChangeText={(text) =>
                              setItems((prev) =>
                                prev.map((i) =>
                                  i.id === item.id ? { ...i, price: text } : i
                                )
                              )
                            }
                            style={styles.input}
                          />
                        </View>

                        <View style={{ flex: 1 }}>
                          <Text style={styles.inputLabel}>Total Quantity</Text>
                          <TextInput
                            value={item.fulfilledQuantity}
                            keyboardType="numeric"
                            onChangeText={(text) =>
                              setItems((prev) =>
                                prev.map((i) =>
                                  i.id === item.id
                                    ? { ...i, fulfilledQuantity: text }
                                    : i
                                )
                              )
                            }
                            style={styles.input}
                          />
                        </View>
                      </View>
                    )}
                  </View>

                  <Text style={styles.itemPrice}>
                    ₹{(Number(item.price) * qty).toLocaleString("en-IN")}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Supplier note */}
          <Text style={styles.sectionTitle}>Supplier Note (Optional)</Text>
          <View style={styles.noteCard}>
            <TextInput
              placeholder="Add any adjustments or quality notes here..."
              placeholderTextColor="#9AA0A6"
              multiline
              returnKeyType="done"
              style={styles.noteInput}
            />
          </View>
        </ScrollView>
        
<View style={styles.bottomBar}>
  {isFulfilled ? (
    <>
      <View style={styles.noteRow}>
        <Feather name="check-circle" size={16} color={GREEN} style={{ marginTop: 1 }} />
        <Text style={styles.noteText}>
          This order has been fulfilled and the invoice is created.
        </Text>
      </View>
      <TouchableOpacity onPress={handleViewInvoice} activeOpacity={0.8} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>View Invoice</Text>
      </TouchableOpacity>
    </>
  ) : (
    <>
      {hasEditedOrder && !showEditedOrder ? (
        <View style={styles.noteRow}>
          <Feather name="info" size={16} color="#F59E0B" style={{ marginTop: 1 }} />
          <Text style={[styles.noteText, { color: "#6B7280" }]}>
            Old order cannot be confirmed once edited. Switch to Edited Order to proceed.
          </Text>
        </View>
      ) : (
        <View style={styles.noteRow}>
          <Feather name="info" size={16} color={GREEN} style={{ marginTop: 1 }} />
          <Text style={styles.noteText}>
            You'll be able to download and share the invoice once the order has been delivered.
          </Text>
        </View>
      )}

      {!isEditing ? (
        <>
          <TouchableOpacity
            disabled={disableActions}
            onPress={handleFulfillOrder}
            activeOpacity={0.8}
            style={[styles.primaryButton, disableActions && { backgroundColor: "#E3E5E8" }]}
          >
            <Text style={[styles.primaryButtonText, disableActions && { color: "#9AA0A6" }]}>
              Fulfill Order
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={disableActions}
            activeOpacity={0.8}
            style={[
              styles.secondaryButton,
              { marginTop: 10 },
              disableActions && { backgroundColor: "#F3F4F6" },
            ]}
          >
            <Text style={[styles.secondaryButtonText, disableActions && { color: "#9CA3AF" }]}>
              Fulfill Order & Reschedule delivery
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            onPress={handleEditOrder}
            activeOpacity={0.8}
            style={[styles.primaryButton, { flex: 1 }]}
          >
            <Text style={styles.primaryButtonText}>Confirm Changes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setItems(originalItems.map((item) => ({ ...item })));
              setIsEditing(false);
            }}
            activeOpacity={0.8}
            style={[styles.cancelButton, { flex: 1 }]}
          >
            <Text style={styles.cancelButtonText}>Cancel Editing</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  )}
</View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const GREEN = "#1B8A4B";
const GREEN_BG = "#EAF6EE";

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F6F6F6" },
  centered: { justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },
  inlineRow: { flexDirection: "row", alignItems: "center" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingTop: 20,
    gap: 6,
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#2A6B2D" },
  backBtn: { padding: 9 },

  // Cards
  groupedCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginBottom: 12,
    overflow: "hidden",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },

  // Info row
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
  },
  infoCol: { flex: 1, alignItems: "center" },
  infoLabelRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  infoLabel: { fontSize: 10, color: "#41493E", marginLeft: 4 },
  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#181D18",
    marginBottom: 2,
  },
  infoSubvalue: { fontSize: 10, color: "#002204", marginTop: 2 },

  chip: {
    backgroundColor: "#F0F1F3",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 4,
  },
  chipText: { fontSize: 11.5, color: "#6B7280" },

  // Toggle
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  toggleLabel: { fontSize: 12, color: "#41493E" },

  // Retailer
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#D9F99D",
  },
  retailerName: { fontSize: 16, fontWeight: "700", color: "#2A2A2A" },
  addressBox: {
    marginTop: 14,
    backgroundColor: GREEN_BG,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  addressText: {
    marginLeft: 8,
    flex: 1,
    fontSize: 12,
    color: "#3D5B47",
    lineHeight: 16,
  },

  // Summary rows
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  summaryRowTotal: {
    borderTopWidth: 1,
    borderTopColor: "#F0F1F3",
    marginTop: 6,
    paddingTop: 10,
  },
  summaryLabel: { fontSize: 12.5, color: "#8A8A8A" },
  summaryValue: { fontSize: 12.5, color: "#2A2A2A", fontWeight: "600" },
  summaryValueBold: { fontSize: 13.5, color: "#2A2A2A", fontWeight: "700" },
  summaryLabelTotal: { fontSize: 14, fontWeight: "700", color: "#181D18" },
  summaryValueTotal: { fontSize: 14, fontWeight: "700", color: GREEN },
  dashedDivider: {
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: "#DDD",
    marginVertical: 12,
  },

  // Items
  itemsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#41493E",
    marginBottom: 10,
  },
  editLink: { color: "#3B82F6", fontSize: 12, marginRight: 6 },
  editHint: { fontSize: 11.5, color: "#9AA0A6", marginBottom: 10 },
  itemsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  itemRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  itemRowDivider: { borderBottomWidth: 1, borderBottomColor: "#F0F1F3" },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: "#F0F1F3",
    alignItems: "center",
    justifyContent: "center",
  },
  itemInfo: { flex: 1 },
  itemName: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#2A2A2A",
    marginBottom: 2,
  },
  itemMeta: { fontSize: 11.5, color: "#9AA0A6" },
  itemPrice: { fontSize: 13.5, fontWeight: "700", color: "#2A2A2A" },
  stockError: {
    marginTop: 4,
    fontSize: 11,
    color: "#DC2626",
    fontWeight: "500",
  },

  // Edit inputs
  editInputsRow: { flexDirection: "row", marginTop: 8 },
  inputLabel: { fontSize: 11.5, color: "#8A8A8A", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#E3E5E8",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: 13,
    color: "#2A2A2A",
  },

  // Note
  noteCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 6,
  },
  noteInput: {
    borderRadius: 12,
    padding: 10,
    fontSize: 12.5,
    minHeight: 70,
    textAlignVertical: "top",
    color: "#2A2A2A",
  },

  // Bottom bar
  bottomBar: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F1F3",
  },
  noteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: GREEN_BG,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  noteText: {
    flex: 1,
    marginLeft: 6,
    fontSize: 11.5,
    color: "#3D5B47",
    lineHeight: 16,
  },
  primaryButton: {
    backgroundColor: GREEN,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13.5 },
  secondaryButton: {
    backgroundColor: GREEN_BG,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: { color: GREEN, fontWeight: "700", fontSize: 13.5 },
  cancelButton: {
    backgroundColor: "#FBEAEA",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelButtonText: { color: "#C24141", fontWeight: "700", fontSize: 13.5 },
});