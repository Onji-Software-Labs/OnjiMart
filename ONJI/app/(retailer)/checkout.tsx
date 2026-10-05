import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { DeliveryTimeSlot, submitOrder, updateCartDelivery } from "@/lib/api/order";
import axiosInstance from "@/lib/api/axiosConfig";
import { secureStorage } from "@/lib/secureStorage";
import SuccessPopup from "@/components/retailer/SuccessPopup";
import supplier from "./(tabs)/supplier";

// Local date as YYYY-MM-DD (toISOString() can shift the day because of the timezone)
const toLocalDateString = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// The next 7 days, starting today
const buildDays = (count = 7) => {
  const today = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    return {
      value: toLocalDateString(d),
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      available: true,
    };
  });
};

const timeSlots: {
  value: DeliveryTimeSlot;
  label: string;
  time: string;
  available: boolean;
}[] = [
  { value: "MORNING", label: "Morning", time: "7 am – 12 pm", available: true },
  { value: "AFTERNOON", label: "Afternoon", time: "12 pm – 3 pm", available: false },
  { value: "EVENING", label: "Evening", time: "3 pm – 6 pm", available: true },
];
type PaymentMethod = "CASH_ON_DELIVERY" | "CREDIT";

const paymentOptions: { value: PaymentMethod; label: string; sub: string; icon: any }[] = [
  { value: "CASH_ON_DELIVERY", label: "Cash on delivery", sub: "Pay when the order arrives", icon: "cash-outline" },
  { value: "CREDIT", label: "Ask for credit", sub: "Pay later, subject to supplier approval", icon: "time-outline" },
];

export default function CheckoutScreen() {
  const router = useRouter();
const { cart } = useLocalSearchParams();
const parsedCart = cart ? JSON.parse(cart as string) : null;
const shopId = parsedCart?.shopId; // or whatever field name the cart actually returns
// ✅ access cartId like this:
const cartId = parsedCart?.cartId;
const supplierId = parsedCart?.supplierId;
const supplierName = parsedCart?.supplierName;
// const items = parsedCart?.items;
const businessId = parsedCart?.businessId; // add this alongside supplierId/supplierName

const days = React.useMemo(() => buildDays(), []);

// Pre-filled if the cart already has a saved delivery choice
const [selectedDate, setSelectedDate] = useState<string | null>(parsedCart?.deliveryDate ?? null);
const [selectedSlot, setSelectedSlot] = useState<DeliveryTimeSlot | null>(
  parsedCart?.deliveryTimeSlot ?? null
);

const [loading, setLoading] = useState(false);
const [showSuccessPopup, setShowSuccessPopup] = useState(false);
const [submittedOrderId, setSubmittedOrderId] = useState<string | number | null>(null);
const [quantities, setQuantities] = useState<{ [key: string]: string }>({});
const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH_ON_DELIVERY");



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

// Save the choice on the cart (the PATCH requires both values)
const saveDelivery = async (date: string | null, slot: DeliveryTimeSlot | null) => {
  if (!cartId || !date || !slot) return;
  try {
    await updateCartDelivery(cartId, date, slot);
  } catch (e: any) {
    console.log("[saveDelivery] error:", e?.response?.data || e?.message);
  }
};

const onSelectDate = (value: string) => {
  setSelectedDate(value);
  saveDelivery(value, selectedSlot);
};

const onSelectSlot = (value: DeliveryTimeSlot) => {
  setSelectedSlot(value);
  saveDelivery(selectedDate, value);
};

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
useEffect(() => {
  console.log('[orderSupplierScreen] received supplierId:', supplierId, 'expected shopId:', '19109c7d-f8a8-42c8-804b-b1478b653a1b');
}, []);
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
  {days.map((item) => (
    <TouchableOpacity
      key={item.value}
      disabled={!item.available}
      onPress={() => onSelectDate(item.value)}
      style={[
        styles.dayBox,
        selectedDate === item.value && styles.dayBoxActive,
        !item.available && styles.dayBoxDisabled,
      ]}
    >
      {selectedDate === item.value && <View style={styles.dotIndicator} />}
      <Text
        style={[
          styles.dayText,
          selectedDate === item.value && styles.dayTextActive,
          !item.available && styles.dayTextDisabled,
        ]}
      >
        {item.day}
      </Text>
      <Text
        style={[
          styles.dateText,
          selectedDate === item.value && styles.dayTextActive,
          !item.available && styles.dayTextDisabled,
        ]}
      >
        {item.date}
      </Text>
      {!item.available && <Text style={styles.unavailableText}>Unavailable</Text>}
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
              onPress={() => setSelectedSlot(slot.value)}
              style={[
                styles.timeBox,
                selectedSlot === slot.value && styles.timeBoxActive,
                !slot.available && styles.timeBoxDisabled,
              ]}
            >
              <View style={styles.radioRow}>
                <View
                  style={[
                    styles.radioOuter,
                    selectedSlot === slot.value && styles.radioOuterActive,
                  ]}
                >
                  {selectedSlot === slot.value && (
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
<TouchableOpacity
  style={styles.addItemsBtn}
  onPress={() =>
    router.push({
      pathname: '/(retailer)/orderSupplierScreen',
      params: { supplierId, supplierName, businessId }, // all already in scope from parsedCart
    })
  }
>
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

{/* ── PAYMENT ── */}
<View style={styles.divider} />
<Text style={styles.sectionTitle}>Payment</Text>

{paymentOptions.map((opt) => {
  const active = paymentMethod === opt.value;
  return (
    <TouchableOpacity
      key={opt.value}
      onPress={() => setPaymentMethod(opt.value)}
      style={[styles.payBox, active && styles.payBoxActive]}
    >
      <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
        {active && <View style={styles.radioInner} />}
      </View>
      <Ionicons name={opt.icon} size={22} color={active ? "#2E7D32" : "#666"} />
      <View style={{ flex: 1 }}>
        <Text style={styles.slotLabel}>{opt.label}</Text>
        <Text style={styles.slotTime}>{opt.sub}</Text>
      </View>
    </TouchableOpacity>
  );
})}

{paymentMethod === "CREDIT" && (
  <Text style={styles.creditNote}>
    Your supplier will review the credit request separately. If it is not accepted, you pay cash on delivery.
  </Text>
)}
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
  style={[
    styles.placeOrderBtn,
    (!selectedDate || !selectedSlot) && { opacity: 0.5 },
  ]}
  disabled={loading || !selectedDate || !selectedSlot}
  onPress={async () => {
    if (!selectedDate || !selectedSlot) {
      alert("Please select a delivery day and time slot.");
      return;
    }
    try {
      setLoading(true);
      const order = await submitOrder(cartId, selectedDate, selectedSlot);
      console.log("Order success:", order);
      router.replace({
        pathname: "/(retailer)/(tabs)/cart",
        params: { success: "true", tab: "orders" },
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
      <SuccessPopup
        visible={showSuccessPopup}
        supplierName={supplierName || "Supplier"}
        onViewOrderDetail={() => {
          setShowSuccessPopup(false);
          if (submittedOrderId) {
            router.replace({
              pathname: "/(supplier)/orderDetails",
              params: { orderId: String(submittedOrderId) },
            });
            return;
          }
          router.replace("/(retailer)/(tabs)/cart");
        }}
        onCheckNotifications={() => {
          setShowSuccessPopup(false);
          router.replace("/(retailer)/notifications");
        }}
      />
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
payBox: {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
  borderWidth: 1,
  borderColor: "#ddd",
  borderRadius: 10,
  padding: 12,
  marginTop: 10,
},
payBoxActive: { borderColor: "#2E7D32", backgroundColor: "#F1F8F2" },
creditNote: { fontSize: 12, color: "#666", marginTop: 8 },
});
