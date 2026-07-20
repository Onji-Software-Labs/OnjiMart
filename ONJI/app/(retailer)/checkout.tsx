import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar,
  Image 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { TextInput } from "react-native";
import { submitOrder } from "@/lib/api/order";
import axiosInstance from "@/lib/api/axiosConfig";
import { secureStorage } from "@/lib/secureStorage";

const days = [
  { day: "Sun", date: "Mar 24", available: true },
  { day: "Mon", date: "Mar 25", available: true },
  { day: "Tue", date: "Mar 26", available: true },
  { day: "Wed", date: "Mar 25", available: false },
  { day: "Thu", date: "Mar 27", available: true },
  { day: "Fri", date: "Mar 28", available: true },
  { day: "Sat", date: "Mar 29", available: false },
];

const timeSlots = [
  { label: "Morning", time: "7 am – 12 pm", available: true },
  { label: "Afternoon", time: "12 pm – 3 pm", available: false },
  { label: "Evening", time: "3 pm – 6 pm", available: true },
];

export default function CheckoutScreen() {
  const router = useRouter();
const { cart } = useLocalSearchParams();
const parsedCart = cart ? JSON.parse(cart as string) : null;

// ✅ access cartId like this:
const cartId = parsedCart?.cartId;
const supplierId = parsedCart?.supplierId;
const supplierName = parsedCart?.supplierName;
// const items = parsedCart?.items;

const [selectedDay, setSelectedDay] = useState("Thu");
const [selectedTime, setSelectedTime] = useState("Morning0");
const [loading, setLoading] = useState(false);
const [quantities, setQuantities] = useState<{ [key: string]: string }>({});




// ─── inside the component ───

const [items, setItems] = useState<any[]>(parsedCart?.items ?? []);

const getAuthHeader = async () => {
  const tok =
    (await secureStorage.getItem("jwtToken")) ||
    (await secureStorage.getItem("token"));
  return tok ? { Authorization: `Bearer ${tok}` } : {};
};

// debounce timers per product, same pattern as the order screen
const debounceRef = React.useRef<Record<string, ReturnType<typeof setTimeout>>>({});

const updateQuantity = (productId: string, quantity: number) => {
  if (debounceRef.current[productId]) clearTimeout(debounceRef.current[productId]);

  debounceRef.current[productId] = setTimeout(async () => {
    try {
      const headers = await getAuthHeader();
      await axiosInstance.put(
        `/api/carts/${cartId}/update`,
        null,
        { params: { productId, quantity }, headers }
      );
    } catch (e: any) {
      console.log("[updateQuantity] error:", e?.message);
    }
  }, 800);
};

const deleteItem = async (productId: string) => {
  try {
    const headers = await getAuthHeader();
    await axiosInstance.delete(`/api/carts/${cartId}/remove`, {
      params: { productId },
      headers,
    });
    // ✅ remove from local state so it disappears from the screen immediately
    setItems((prev) => prev.filter((it) => (it.productId ?? it.itemId) !== productId));
  } catch (e: any) {
    console.log("[deleteItem] error:", e?.message);
    alert("Failed to remove item. Try again.");
  }
};

  if (!parsedCart) return null;

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/(retailer)/(tabs)/cart")} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* SUPPLIER */}
        <View style={styles.supplierRow}>
          <View style={styles.supplierAvatar} />
          <View>
            <Text style={styles.supplierName}>{parsedCart.supplierName}</Text>
            <Text style={styles.supplierSub}>Aslam</Text>
          </View>
        </View>

        {/* ── SCHEDULE DELIVERY ──────────────────────────────── */}
        <Text style={styles.subtitle}>Schedule delivery</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {days.map((item) => (
            <TouchableOpacity
              key={item.day}
              disabled={!item.available}
              onPress={() => setSelectedDay(item.day)}
              style={[
                styles.dayBox,
                selectedDay === item.day && styles.dayBoxActive,
                !item.available && styles.dayBoxDisabled,
              ]}
            >
              {selectedDay === item.day && (
                <View style={styles.dotIndicator} />
              )}
              <Text
                style={[
                  styles.dayText,
                  selectedDay === item.day && styles.dayTextActive,
                  !item.available && styles.dayTextDisabled,
                ]}
              >
                {item.day}
              </Text>
              <Text
                style={[
                  styles.dateText,
                  selectedDay === item.day && styles.dayTextActive,
                  !item.available && styles.dayTextDisabled,
                ]}
              >
                {item.date}
              </Text>
              {!item.available && (
                <Text style={styles.unavailableText}>Unavailable</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── TIME OF DAY ────────────────────────────────────── */}
        <Text style={[styles.subtitle, { marginTop: 16 }]}>
          Select time of the day
        </Text>

        <View style={styles.timeRow}>
          {timeSlots.map((slot, i) => (
            <TouchableOpacity
              key={i}
              disabled={!slot.available}
              onPress={() => setSelectedTime(slot.label + i)}
              style={[
                styles.timeBox,
                selectedTime === slot.label + i && styles.timeBoxActive,
                !slot.available && styles.timeBoxDisabled,
              ]}
            >
              <View style={styles.radioRow}>
                <View
                  style={[
                    styles.radioOuter,
                    selectedTime === slot.label + i && styles.radioOuterActive,
                  ]}
                >
                  {selectedTime === slot.label + i && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <View>
                  <Text style={styles.slotLabel}>{slot.label}</Text>
                  <Text style={styles.slotTime}>{slot.time}</Text>
                  {!slot.available && (
                    <Text style={styles.unavailableText}>Unavailable</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── QUANTITY ───────────────────────────────────────── */}
        <View style={styles.divider} />

        <View style={styles.qtyHeader}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <TouchableOpacity style={styles.addItemsBtn}>
            <Text style={styles.addItemsText}>Add items</Text>
            <View style={styles.addItemsIcon}>
              <Text style={styles.addItemsPlus}>+</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.minOrderNote}>
          Minimum total order quantity 300kg*
        </Text>

{items.map((item: any, index: number) => {
  const productId = item.productId ?? item.itemId;
  const qty = Number(quantities[productId] ?? item.quantity ?? 0);
  const totalPrice = (qty * (item.price ?? 0)).toFixed(0);

  return (
    <View
      key={`${parsedCart.supplierId}-${productId}-${index}`}
      style={styles.cartItemRow}
    >
      {/* IMAGE — same URL-based image for every product, with a clean fallback */}
      <View style={styles.cartItemImgBox}>
        {item.imageUri || item.image?.uri ? (
          <Image
            source={{ uri: item.imageUri ?? item.image?.uri }}
            style={styles.cartItemImg}
          />
        ) : (
          <Ionicons name="cube-outline" size={20} color="#fff" />
        )}
      </View>

      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName}>{item.name}</Text>
        <Text style={styles.cartItemPrice}>
          ₹{item.price ?? 0}/{item.unit ?? "kg"}
        </Text>
      </View>

      <View style={styles.customKgBox}>
        <View style={styles.customKgInputRow}>
          <TextInput
            style={styles.customKgInput}
            value={String(qty)}
            keyboardType="numeric"
            selectTextOnFocus
            onChangeText={(val) => {
              const n = parseInt(val.replace(/[^0-9]/g, ""), 10);
              if (isNaN(n) || n < 0) return;

              setQuantities((prev) => ({ ...prev, [productId]: n }));

              if (n === 0) {
                deleteItem(productId); // qty 0 = remove, same as the order screen
              } else {
                updateQuantity(productId, n);
              }
            }}
          />
          <Text style={styles.customKgText}>{item.unit ?? "kg"}</Text>
        </View>
        <Text style={styles.totalPrice}>₹{totalPrice}</Text>
      </View>

      <TouchableOpacity style={styles.itemAction}>
        <Feather name="bookmark" size={18} color="#444" />
        <Text style={styles.itemActionText}>Save</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.itemAction} onPress={() => deleteItem(productId)}>
        <Feather name="trash-2" size={18} color="#444" />
        <Text style={styles.itemActionText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
})}
      </ScrollView>

      {/* BOTTOM BAR */}
      <View style={styles.bottomBar}>
        <View style={styles.deliverRow}>
          <Text style={styles.deliverText}>
            Deliver to:{" "}
            <Text style={styles.deliverBold}>North west, Ambalpady</Text>
          </Text>
          <TouchableOpacity style={styles.changeStorePill}>
            <Text style={styles.changeStoreLabel}>Store 1</Text>
            <Text style={styles.changeStoreLink}>Change</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.placeOrderBtn}
          disabled={loading}
          onPress={async () => {
            try {
              console.log("Placing order with:", cartId, selectedDay, selectedTime);
              setLoading(true);
              const order = await submitOrder(cartId, selectedDay, selectedTime);
              console.log("Order success:", order);
              router.replace({
                pathname: "/(retailer)/(tabs)/cart",
                params: { success: "true" },
              });
            } catch (err) {
              console.log(err);
              alert("Order failed. Try again.");
            } finally {
              setLoading(false);
            }
          }}
        >
          <Text style={styles.placeOrderText}>
            {loading ? "Placing…" : "Place Order Request"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 5,
    paddingTop: 5,
    marginTop: 15,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#2E7D32" },

  scroll: { padding: 16, paddingBottom: 180 },

  supplierRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  supplierAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ddd",
  },
  supplierName: { fontWeight: "700", fontSize: 15, color: "#111" },
  supplierSub: { fontSize: 12, color: "#666", marginTop: 2 },

  // ── Day picker (identical to OrderSupplierScreen) ──
  subtitle: { fontSize: 14, fontWeight: "600", color: "#111", marginBottom: 12 },
  dayBox: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    minWidth: 60,
  },
  dayBoxActive: { borderColor: "#2E7D32", backgroundColor: "#2E7D32" },
  dayBoxDisabled: { opacity: 0.4 },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
    marginBottom: 2,
  },
  dayText: { fontSize: 12, color: "#444", fontWeight: "500" },
  dayTextActive: { color: "#fff" },
  dayTextDisabled: { color: "#999" },
  dateText: { fontSize: 11, color: "#666", marginTop: 2 },
  unavailableText: { fontSize: 9, color: "#999", marginTop: 2 },

  // ── Time slots (identical to OrderSupplierScreen) ──
  timeRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  timeBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
  },
  timeBoxActive: { borderColor: "#2E7D32" },
  timeBoxDisabled: { opacity: 0.4 },
  radioRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterActive: { borderColor: "#2E7D32" },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#2E7D32",
  },
  slotLabel: { fontSize: 12, fontWeight: "600", color: "#111" },
  slotTime: { fontSize: 10, color: "#666" },

  divider: { height: 1, backgroundColor: "#EEE", marginVertical: 16 },

  // ── Items ──
  qtyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#111" },
  addItemsBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#3B82F6",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
    gap: 6,
  },
  addItemsText: { color: "#3B82F6", fontWeight: "600", fontSize: 13 },
  addItemsIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
  },
  addItemsPlus: { color: "#3B82F6", fontSize: 12, fontWeight: "700" },
  minOrderNote: { fontSize: 12, color: "#666", marginBottom: 12 },

  itemCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 12,
    marginBottom: 10,
  },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  itemImgBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#E6F4EA",
    alignItems: "center",
    justifyContent: "center",
  },
  itemMeta: { flex: 1 },
  itemName: { fontWeight: "600", fontSize: 13, color: "#111" },
  itemUnitPrice: { fontSize: 12, color: "#666", marginTop: 2 },
  itemActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  customQtyBox: { alignItems: "flex-end" },
  customQtyInput: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#2E7D32",
    color: "#111",
    minWidth: 56,
    textAlign: "right",
    paddingVertical: 2,
    fontSize: 13,
    fontWeight: "600",
  },
  customQtyUnit: { fontSize: 10, color: "#888", marginTop: 1 },
  itemLineTotal: {
    fontWeight: "700",
    fontSize: 13,
    color: "#2E7D32",
    marginTop: 2,
  },
  itemAction: { alignItems: "center", gap: 2 },
  itemActionText: { fontSize: 10, color: "#444" },

  // ── Bottom bar ──
  bottomBar: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
    gap: 12,
  },
  deliverRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  deliverText: { fontSize: 13, color: "#374151", flex: 1 },
  deliverBold: { fontWeight: "600", color: "#111" },
  changeStorePill: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#9CA3AF",
    borderStyle: "dashed",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  changeStoreLabel: { fontWeight: "600", color: "#111", fontSize: 13 },
  changeStoreLink: { color: "#2E7D32", fontWeight: "600", fontSize: 13 },
  placeOrderBtn: {
    backgroundColor: "#2E7D32",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  placeOrderText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  cartItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    gap: 8,
  },
  cartItemImgBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2E7D32",
    alignItems: "center",
    justifyContent: "center",
  },
  cartItemImg: { width: 36, height: 36, borderRadius: 18 },
  cartItemInfo: { flex: 1 },
  cartItemName: { fontSize: 13, fontWeight: "600", color: "#111" },
  cartItemPrice: { fontSize: 12, color: "#666", marginTop: 2 },
  customKgBox: {
    alignItems: "center",
    // borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingBottom: 4,
    minWidth: 80,
  },
  customKgInputRow: { flexDirection: "row", alignItems: "center" },
  customKgInput: {
    borderBottomWidth: 1,
    fontSize: 12,
    color: "#333",
    minWidth: 50,
    textAlign: "center",
    padding: 0,
  },
  customKgText: { fontSize: 14, color: "#333" },
  totalPrice: { fontSize: 12, color: "#111", fontWeight: "600", marginTop: 2 },

});