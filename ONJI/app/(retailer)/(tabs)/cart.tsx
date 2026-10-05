import {
  Feather,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useEffect, useCallback} from "react";
import { ActivityIndicator, RefreshControl } from "react-native";
import axiosInstance from "@/lib/api/axiosConfig";
import { localStorage } from "@/lib/localStorage";
import { secureStorage } from "@/lib/secureStorage";

import * as Clipboard from "expo-clipboard";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { getCartByShopId, ICartDTO } from "@/lib/api/cart";

import { useRouter } from "expo-router";
import { fmtDate, fmtTime } from "@/lib/invoiceFormat";
import { OrderDates } from "@/components/orderTime";

const chip = {
  backgroundColor: "#F3F4F6",
  paddingHorizontal: 8,
  paddingVertical: 2,
  borderRadius: 10,
  alignSelf: "center",
} as const;

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  requestedQuantity: number;
  unitPrice: number;
  totalPrice: number;
  status: string;
  imageUri?: string | null;   
  unit?: string;              
}

interface SupplierCart {
  cartId: string;
  supplierId: string;
  supplierName: string;
  ownerName: string;
  avatarUri: any;
  totalItems: number;
  totalQty: number;
  items: CartItem[];
  deliveryDate?: string | null;        // ← add
  deliveryTimeSlot?: string | null;    // ← add
}

interface PreviousOrder {
  orderId: string;
  date: string;
  time: string;
  amount: string;
}

interface Order {
  id: string;
  supplierName: string;
  avatarUri: any;
  totalOrdersCompleted: number;
  amount: string;
  latestOrderId: string;
  status: "NEW" | "PROCESSING" | "COMPLETED" | "CANCELLED";
  date: string;
  time: string;
  previousOrders: PreviousOrder[];
  supplierPhone?: string;
 orderTimestamp: number;
  approvedTimestamp: number | null;
  approvedDate?: string;
  approvedTime?: string;
}
// ─────────────────────────────────────────────────────────────
// AVATAR — update this path to your actual PNG
// ─────────────────────────────────────────────────────────────
const PLACEHOLDER_AVATAR = require("../../../assets/images/3davatar.png");

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

type FilterChip = "This week" | "Recent" | "This Month" | "Custom Date";
let lastActiveTab: "cart" | "orders" = "cart";
let lastOrderStatusTab: "active" | "pending" | "approved" = "active";
// ─────────────────────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────────────────────

export default function CartScreen() {
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [cartData, setCartData] = useState<SupplierCart[]>([]);
// ─── inside the component ───
const router = useRouter();
  useEffect(() => {
    if (tab === "orders") {
      setActiveTab("orders");
    }
  }, [tab]);

const [ordersData, setOrdersData] = useState<Order[]>([]);
const [ordersLoading, setOrdersLoading] = useState(false);
const [ordersError, setOrdersError] = useState<string | null>(null);
const [activeTab, setActiveTab] = useState<"cart" | "orders">(lastActiveTab);
const [orderStatusTab, setOrderStatusTab] = useState<"active" | "pending" | "approved">(lastOrderStatusTab);

  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [activeChip, setActiveChip] = useState<FilterChip | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
const APPROVED_STATUSES = ["APPROVED", "COMPLETED", "DELIVERED"];

const filteredOrders = ordersData
  .filter((item) => {
    if (orderStatusTab === "active") return item.status === "NEW";
    if (orderStatusTab === "pending") return item.status === "PROCESSING";
    return APPROVED_STATUSES.includes(item.status);
  })
  .sort((a, b) => {
    if (orderStatusTab === "approved") {
      // latest approved first; old orders without approvedAt fall back to order date
      const aTime = a.approvedTimestamp ?? a.orderTimestamp;
      const bTime = b.approvedTimestamp ?? b.orderTimestamp;
      return bTime - aTime;
    }
    return b.orderTimestamp - a.orderTimestamp;
  });

  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);


useEffect(() => { lastActiveTab = activeTab; }, [activeTab]);
useEffect(() => { lastOrderStatusTab = orderStatusTab; }, [orderStatusTab]);

const fetchCart = useCallback(async () => {
  try {
    setCartLoading(true);
    setCartError(null);

    const shopId = await localStorage.getItem("shopId");
    if (!shopId) {
      setCartData([]);
      return;
    }
    // ✅ load cached product data (images, etc.) written by the order screen
    let cachedProducts: Record<string, any> = {};
    try {
      const cached = await localStorage.getItem("cachedProducts");
      if (cached) cachedProducts = JSON.parse(cached);
    } catch {}

    let cartsResponse: ICartDTO[];
    try {
      cartsResponse = await getCartByShopId(shopId);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setCartData([]);
        return;
      }
      throw err;
    }

    const validCarts = (cartsResponse ?? []).filter(
      (cart) => (cart.items?.length ?? 0) > 0
    );

    if (validCarts.length === 0) {
      setCartData([]);
      return;
    }

    const carts: SupplierCart[] = validCarts.map((cart) => {
      const validItems = (cart.items ?? []).filter((i) => (i.quantity ?? 0) > 0);
      return {
        cartId: cart.id,
        supplierId: cart.supplierId ?? "",
        supplierName: cart.supplierName || "Supplier",
        ownerName: "",
        avatarUri: PLACEHOLDER_AVATAR,
        totalItems: validItems.length,
        totalQty: validItems.reduce((sum, i) => sum + (i.quantity ?? 0), 0),
        deliveryDate: cart.deliveryDate ?? null,           // ← add
        deliveryTimeSlot: cart.deliveryTimeSlot ?? null,   // ← add
        items: validItems.map((i) => {
  const cached = cachedProducts[String(i.productId)];
  const unitPrice = i.price ?? cached?.price ?? 0;
  const quantity = i.quantity ?? 0;
            return {
            id: i.id,
            productId: i.productId,
            productName: i.productName,
            requestedQuantity: i.quantity ?? 0,
            unitPrice: i.price || cached?.price  || 0,
            // totalPrice: i.totalPrice ?? 0,
            status: "",
            imageUri: cached?.image?.uri ?? null,   
            unit: cached?.unit ?? "kg",              
            totalPrice: unitPrice * quantity,

          };
        }),
      };
    });

    setCartData(carts);
  } catch (err) {
    setCartError("Failed to load cart. Please try again.");
  } finally {
    setCartLoading(false);
    setRefreshing(false);
  }
}, []);

const fetchOrders = useCallback(async () => {
  try {
    setOrdersLoading(true);
    setOrdersError(null);

    const retailerId = await secureStorage.getItem("userId");
    
    //ID for testing
    //const retailerId = "769814f3-7a8a-43f3-b5e8-7892212da0cc";
    
    console.log("CALLING ORDERS API...");
    console.log("Retailer ID:", retailerId);

    if (!retailerId) {
      setOrdersData([]);
      return;
    }

    const response = await axiosInstance.get(
      `/api/orders/retailer/${retailerId}`
    );

    //console.log("Orders response:", response.data);
    console.log(
  "Orders response:",
  JSON.stringify(response.data, null, 2)
);

const data = Array.isArray(response.data) ? response.data : [];

// Newest first
data.sort(
  (a: any, b: any) =>
    new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
);

const formattedOrders: Order[] = data.map((order: any) => {
  const itemsTotal =
    order.items?.reduce(
      (sum: number, item: any) => sum + (item.totalPrice ?? 0),
      0
    ) ?? 0;

  const grandTotal =
    order.grandTotal ??
    order.totalAmount ??
    itemsTotal + (order.gstAmount ?? order.taxAmount ?? 0);
const approvedAt = order.approvedAt ? new Date(order.approvedAt) : null;

  return {
    id: order.id,
    supplierName: order.supplierName ?? "Supplier",
    avatarUri: PLACEHOLDER_AVATAR,
    supplierPhone: order.supplierPhoneNumber ?? "",
    totalOrdersCompleted: order.items?.length ?? 0,
    amount: `₹${Number(grandTotal).toFixed(2)}`,
    latestOrderId: `#${order.id.slice(0, 8)}`,
    status: order.status ?? "NEW",
    date: fmtDate(order.orderDate),
    time: new Date(order.orderDate).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
      orderTimestamp: new Date(order.orderDate).getTime(),
  approvedTimestamp: approvedAt ? approvedAt.getTime() : null,
  approvedDate: approvedAt ? fmtDate(approvedAt) : undefined,
  approvedTime: approvedAt ? fmtTime(approvedAt) : undefined,
    previousOrders: [],
  };
});

setOrdersData(formattedOrders);

  } catch (err: any) {
    console.log(
      "Orders API failed:",
      err?.response?.data
    );

    setOrdersError("Failed to load orders");
  } finally {
    setOrdersLoading(false);
  }
}, []);

    useFocusEffect(
    useCallback(() => {
      console.log("Fetching latest cart...");
      fetchCart();
    }, [])
  );

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab]);

    const onRefresh = () => {
      setRefreshing(true);
      fetchCart();
    };

  // ── TOGGLE ACCORDION ──
  const toggleAccordion = (orderId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  // ── REMOVE CART ──
const removeSupplier = async (cartId: string) => {
  try {
    // find this cart's items so we know which productIds to remove
    const cart = cartData.find((c) => c.cartId === cartId);
    if (!cart) return;

    // remove every product in this cart, one call per productId
    await Promise.all(
      cart.items.map((item) =>
        axiosInstance.delete(`/api/carts/${cartId}/remove`, {
          params: { productId: item.productId },
        })
      )
    );

    fetchCart();
  } catch (err) {
    console.log("Failed to remove cart:", err);
  }
};
  const handleCheckout = (item: SupplierCart) => {
  console.log("[handleCheckout] navigating with:", item.cartId);
  router.push({
    pathname: "/(retailer)/checkout",
    params: {
      cart: JSON.stringify({
        supplierId: item.supplierId,
        supplierName: item.supplierName,
        cartId: item.cartId,
        deliveryDate: item.deliveryDate ?? null,          // ← add
        deliveryTimeSlot: item.deliveryTimeSlot ?? null,  // ← add
        items: item.items.map((it) => ({
          productId: it.productId,
          quantity: it.requestedQuantity,
          name: it.productName,
          price: it.unitPrice,
          unit: it.unit ?? "kg",
          imageUri: it.imageUri ?? null,
        })),
      }),
    },
  });
  };
const handleNudge = async (item: Order) => {
  try {
    // await axiosInstance.post(`/api/orders/${item.id}/nudge`); // adjust to your real endpoint
    Alert.alert("Reminder sent", `${item.supplierName} has been notified to review this order.`);
  } catch (err: any) {
    console.log("[handleNudge] error:", err?.response?.data || err?.message);
    Alert.alert("Error", "Could not send reminder. Try again.");
  }
};

  // ─────────────────────────────────────────────────────────────
  // CART CARD
  // ─────────────────────────────────────────────────────────────

  const renderCartCard = ({ item }: { item: SupplierCart }) => {
    const visibleItems = item.items.slice(0, 9);
    const remaining = item.totalItems - 9;

    return (
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 18,
          padding: 14,
          marginBottom: 18,
          borderWidth: 1,
          borderColor: "#E5E7EB",
        }}
      >
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
          <Image
            source={item.avatarUri}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              marginRight: 10,
              backgroundColor: "#D1FAE5",
            }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>
              {item.supplierName}
            </Text>
            <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
              {item.ownerName}
            </Text>
          </View>
          <TouchableOpacity onPress={() => removeSupplier(item.cartId)}>
            <Feather name="x" size={22} color="#15803D" />
          </TouchableOpacity>
        </View>

        {/* ITEMS GRID */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 18 }}>
  {visibleItems.map((cartItem, index) => (
  <View key={index} style={{
    width: 52, height: 54, borderRadius: 16,
    borderWidth: 1.5, borderColor: "#2E7D32",
    alignItems: "center", justifyContent: "center",
    marginRight: 10, marginBottom: 10, backgroundColor: "#fff",
    overflow: "hidden",
  }}>
    {cartItem.imageUri ? (
      <Image
        source={{ uri: cartItem.imageUri }}
        style={{ width: "100%", height: "100%" }}
        resizeMode="cover"
      />
    ) : (
      <Text
        numberOfLines={2}
        style={{
          fontSize: 10,
          color: "#15803D",
          fontWeight: "600",
          textAlign: "center",
          paddingHorizontal: 4,
        }}
      >
        {cartItem.productName}
      </Text>
    )}
  </View>
))}
          {remaining > 0 && (
            <View
              style={{
                width: 52,
                height: 54,
                borderRadius: 16,
                borderWidth: 1.5,
                borderColor: "#15803D",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
                backgroundColor: "#F0FDF4",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#15803D" }}>
                +{remaining}
              </Text>
            </View>
          )}
        </View>

        {/* FOOTER */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
          <View>
            <View style={{ flexDirection: "row", marginBottom: 6 }}>
              <Text style={{ fontSize: 12, color: "#000000" }}>Total Shipment items</Text>
              <Text style={{ fontSize: 12, fontWeight: "700", marginLeft: 10 }}>
                {item.totalItems} Items
              </Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text style={{ fontSize: 12, color: "#000000" }}>Total Quantity</Text>
              <Text style={{ fontSize: 12, color: "#72797D", marginLeft: 4 }}>(weight)</Text>
              <Text style={{ fontSize: 12, fontWeight: "700", marginLeft: 10 }}>
                {item.totalQty} Kg
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleCheckout(item)}
            style={{
              backgroundColor: "#2E7D32",
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12, marginRight: 4 }}>
              Checkout
            </Text>
            <Feather name="arrow-right" size={15} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ─────────────────────────────────────────────────────────────
  // ORDER CARD
  // ─────────────────────────────────────────────────────────────
const ORDER_STATUS_STYLES: Record<Order["status"], { label: string; bg: string; color: string }> = {
  NEW: { label: "New", bg: "#DBEAFE", color: "#1D4ED8" },
  PROCESSING: { label: "Processing", bg: "#FEF3C7", color: "#B45309" },
  COMPLETED: { label: "Approved", bg: "#DCFCE7", color: "#15803D" },
  CANCELLED: { label: "Cancelled", bg: "#FEE2E2", color: "#B91C1C" },
};
const renderOrderCard = (item: Order) => {
  const isExpanded = expandedOrders.has(item.id);
  const hasPreviousOrders = item.previousOrders.length > 0;
  const statusStyle = ORDER_STATUS_STYLES[item.status];

  return (
    <View
      key={item.id}
      style={{
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 16,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: "#ECECEC",
      }}
    >
      {/* TOP: avatar + name + location/phone */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image
          source={item.avatarUri}
          style={{
            width: 46,
            height: 46,
            borderRadius: 23,
            marginRight: 12,
            backgroundColor: "#D1FAE5",
          }}
        />
        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={2}
            style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}
          >
            {item.supplierName}
          </Text>

          {( !!item.supplierPhone) && (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "flex-start",
                gap: 6,
                marginTop: 4,
              }}
            >
              {/* {!!item.supplierLocation && (
                <View style={chip}>
                  <Text style={{ fontSize: 10, color: "#6B7280" }}>
                    {item.supplierLocation}
                  </Text>
                </View>
              )} */}
              {!!item.supplierPhone && (
                <View style={chip}>
                  <Text style={{ fontSize: 10, color: "#6B7280" }}>
                    {item.supplierPhone}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View> 
      </View>

      {/* ORDER ID + COPY + STATUS (same line) */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flexShrink: 1 }}>
          <Text style={{ fontSize: 11, color: "#9CA3AF", marginRight: 6 }}>
            Latest Order Id:
          </Text>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ fontSize: 14, fontWeight: "700", color: "#111827", maxWidth: 110 }}
          >
            {item.latestOrderId}
          </Text>
          <TouchableOpacity
            style={{ marginLeft: 4, padding: 4 }}
            onPress={async () => {
              try {
                await Clipboard.setStringAsync(item.latestOrderId);
                setCopiedId(item.id);
                setTimeout(() => setCopiedId(null), 1500);
              } catch (e) {
                console.log("[copy] error:", e);
              }
            }}
          >
            <MaterialCommunityIcons
              name={copiedId === item.id ? "check" : "content-copy"}
              size={16}
              color={copiedId === item.id ? "#15803D" : "#2A6B2D"}
            />
          </TouchableOpacity>
        </View>

        <View
          style={{
            backgroundColor: statusStyle.bg,
            paddingHorizontal: 12,
            paddingVertical: 5,
            borderRadius: 20,
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
          }}
        >
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: statusStyle.color,
            }}
          />
          <Text style={{ color: statusStyle.color, fontSize: 11, fontWeight: "700" }}>
            {statusStyle.label}
          </Text>
        </View>
      </View>

<OrderDates
  placedDate={item.date}
  placedTime={item.time}
  approvedDate={item.approvedDate}
  approvedTime={item.approvedTime}
/>

    {/* DASHED DIVIDER */}
<View
  style={{
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    marginTop: 16,
    marginBottom: 16,
  }}
/>

    {/* GRAND TOTAL */}
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "700", color: "#1F2937" }}>Grand Total</Text>
      <Text style={{ fontSize: 20, fontWeight: "700", color: "#0C5217" }}>{item.amount}</Text>
    </View>

      {/* ACTION BUTTONS */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: hasPreviousOrders ? 16 : 0,
        }}
      >
        <TouchableOpacity
          onPress={() =>
            router.push({ pathname: "/orderDetails", params: { orderId: item.id } })
          }
          style={{
            flex: 1,
            backgroundColor: "#2E7D32",
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
            marginRight: 10,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Order Details</Text>
        </TouchableOpacity>

        {["NEW", "PROCESSING"].includes(item.status) && (
          <TouchableOpacity
            onPress={() => handleNudge(item)}
            style={{
              flex: 1,
              backgroundColor: "#EAF6EE",
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <Ionicons name="notifications-outline" size={16} color="#15803D" />
            <Text style={{ color: "#15803D", fontWeight: "600" }}>Nudge</Text>
          </TouchableOpacity>
        )}

        {["COMPLETED", "APPROVED", "DELIVERED"].includes(item.status) && (
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: "#F3F4F6",
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#15803D", fontWeight: "700" }}>Rate Order</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* PREVIOUS ORDERS ACCORDION */}
      {hasPreviousOrders && (
        <View>
          <View style={{ height: 1, backgroundColor: "#F3F4F6", marginBottom: 14 }} />

          <TouchableOpacity
            onPress={() => toggleAccordion(item.id)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialCommunityIcons
                name="history"
                size={18}
                color="#6B7280"
                style={{ marginRight: 6 }}
              />
              <Text style={{ fontSize: 13, color: "#6B7280", fontWeight: "600" }}>
                +{item.previousOrders.length} previous order
                {item.previousOrders.length > 1 ? "s" : ""}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text
                style={{ fontSize: 13, color: "#15803D", fontWeight: "600", marginRight: 4 }}
              >
                {isExpanded ? "Hide" : "View all"}
              </Text>
              <Feather
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={16}
                color="#15803D"
              />
            </View>
          </TouchableOpacity>

          {isExpanded && (
            <View style={{ marginTop: 14 }}>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -6 }}>
                {item.previousOrders.map((prev, index) => (
                  <TouchableOpacity
                    key={prev.orderId}
                    activeOpacity={0.8}
                    style={{
                      width: "48%",
                      marginHorizontal: "1%",
                      marginBottom: 10,
                      backgroundColor: index === 0 ? "#2E7D32" : "#F9FAFB",
                      borderRadius: 12,
                      padding: 12,
                      borderWidth: index === 0 ? 0 : 1,
                      borderColor: "#E5E7EB",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        color: index === 0 ? "#A7F3D0" : "#9CA3AF",
                        marginBottom: 4,
                      }}
                    >
                      {prev.date} • {prev.time}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: index === 0 ? "#fff" : "#374151",
                        marginBottom: 6,
                      }}
                    >
                      Order Id {prev.orderId}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color: index === 0 ? "#fff" : "#111827",
                        }}
                      >
                        {prev.amount}
                      </Text>
                      <Feather
                        name="chevron-right"
                        size={16}
                        color={index === 0 ? "#A7F3D0" : "#9CA3AF"}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* TOP TOGGLE */}
      <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
        <View
          style={{
    backgroundColor: '#ECEDEE',
  borderRadius: 12,          // was 20
  flexDirection: 'row',
  padding: 3,                 // was 4
  marginBottom: 12,           // was 16
  marginTop:10,
  height:45,
          }}
        >
          <TouchableOpacity
            onPress={() => setActiveTab("cart")}
            style={{
      flex: 1,
      backgroundColor: activeTab === 'cart' ? '#fff' : 'transparent',
      paddingVertical: 9,      // was 14
      borderRadius: 8,        // was 16
      alignItems: 'center',
            }}
          >
    <Text style={{ color: activeTab === 'cart' ? '#2E7D32' : '#353637', fontWeight: '600', fontSize: 13 }}>

              Cart
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("orders")}
            style={{
      flex: 1,
      backgroundColor: activeTab === 'orders' ? '#fff' : 'transparent',
      paddingVertical: 9,      // was 14
      borderRadius: 8,        // was 16
      alignItems: 'center',
            }}
          >
    <Text style={{ color: activeTab === 'orders' ? '#2E7D32' : '#353637', fontWeight: '600', fontSize: 13 }}>

              Orders
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* CART TAB */}
        {activeTab === "cart" ? (
          cartLoading ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator size="large" color="#15803D" />
            </View>
          ) : cartError ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                padding: 20,
              }}
            >
              <Text
                style={{
                  color: "#EF4444",
                  textAlign: "center",
                  marginBottom: 16,
                }}
              >
                {cartError}
              </Text>

              <TouchableOpacity
                onPress={fetchCart}
                style={{
                  backgroundColor: "#15803D",
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={cartData}
              renderItem={renderCartCard}
              keyExtractor={(item) => item.cartId}
              ListEmptyComponent={
                <View style={{ alignItems: "center", marginTop: 80 }}>
                  <MaterialCommunityIcons
                    name="cart-outline"
                    size={64}
                    color="#D1D5DB"
                  />
                  <Text
                    style={{
                      color: "#9CA3AF",
                      marginTop: 16,
                      fontSize: 16,
                    }}
                  >
                    Your cart is empty
                  </Text>
                </View>
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                padding: 20,
                paddingBottom: 120,
              }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={["#15803D"]}
                />
              }
            />
          )
        ) : (
        // ORDERS TAB
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        >
          {/* SEARCH + FILTER ICON */}
          <View style={{ flexDirection: "row", marginBottom: 18 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: "#fff",
                borderRadius: 14,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 14,
                marginRight: 12,
                borderWidth: 1,
                borderColor: "#E5E7EB",
              }}
            >
              <Feather name="search" size={18} color="#9CA3AF" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder='Search "Random kaka"'
                placeholderTextColor="#9CA3AF"
                style={{ flex: 1, height: 50, marginLeft: 10 }}
              />
            </View>
            <TouchableOpacity
              style={{
                width: 50,
                height: 50,
                borderRadius: 14,
                backgroundColor: "#fff",
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#E5E7EB",
              }}
            >
              <Ionicons name="options-outline" size={22} color="#15803D" />
            </TouchableOpacity>
          </View>

          {/* ACTIVE / DELIVERED TABS */}
          <View style={{ flexDirection: "row", marginBottom: 18 }}>
            <TouchableOpacity
              onPress={() => setOrderStatusTab("active")}
              style={{
                marginRight: 24,
                borderBottomWidth: orderStatusTab === "active" ? 2 : 0,
                borderBottomColor: "#15803D",
                paddingBottom: 8,
              }}
            >
              <Text
                style={{
                  color: orderStatusTab === "active" ? "#15803D" : "#4B5563",
                  fontWeight: orderStatusTab === "active" ? "700" : "500",
                }}
              >
                Active Orders
              </Text>
            </TouchableOpacity>
  <TouchableOpacity
    onPress={() => setOrderStatusTab("pending")}
    style={{
      marginRight: 24,
      borderBottomWidth: orderStatusTab === "pending" ? 2 : 0,
      borderBottomColor: "#15803D",
      paddingBottom: 8,
    }}
  >
    <Text
      style={{
        color: orderStatusTab === "pending" ? "#15803D" : "#4B5563",
        fontWeight: orderStatusTab === "pending" ? "700" : "500",
      }}
    >
      Pending 
    </Text>
  </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setOrderStatusTab("approved")}
              style={{
                borderBottomWidth: orderStatusTab === "approved" ? 2 : 0,
                borderBottomColor: "#15803D",
                paddingBottom: 8,
              }}
            >
              <Text
                style={{
                  color: orderStatusTab === "approved" ? "#15803D" : "#4B5563",
                  fontWeight: orderStatusTab === "approved" ? "700" : "500",
                }}
              >
                Approved 
              </Text>
            </TouchableOpacity>
          </View>

          {/* FILTER CHIPS */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 18 }}
          >
            {(["This week", "Recent", "This Month", "Custom Date"] as FilterChip[]).map((chip) => {
              const isActive = activeChip === chip;
              return (
                <TouchableOpacity
                  key={chip}
                  onPress={() => setActiveChip(isActive ? null : chip)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: isActive ? "#9333EA" : "#F3E8FF",
                    marginRight: 10,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: isActive ? "#fff" : "#9333EA",
                      fontSize: 13,
                      fontWeight: "600",
                    }}
                  >
                    {chip}
                  </Text>
                  {isActive && (
                    <Feather name="x" size={13} color="#fff" style={{ marginLeft: 6 }} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ORDER CARDS */}
          {filteredOrders.length === 0 ? (
            <View style={{ alignItems: "center", marginTop: 60 }}>
              <MaterialCommunityIcons name="package-variant" size={64} color="#D1D5DB" />
              <Text style={{ color: "#9CA3AF", marginTop: 16, fontSize: 16 }}>
                No {orderStatusTab} orders
              </Text>
            </View>
          ) : (
            filteredOrders.map((item) => renderOrderCard(item))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
