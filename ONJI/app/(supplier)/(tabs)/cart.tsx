import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  LayoutAnimation,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import * as Clipboard from "expo-clipboard";
import axiosInstance from "@/lib/api/axiosConfig";
import { secureStorage } from "@/lib/secureStorage";
import { getInvoiceByOrderId } from "@/lib/api/invoice";
import { fmtDate, fmtTime } from "@/lib/invoiceFormat";
import { OrderDates } from "@/components/orderTime";
import AggregateOrders from "../AggregateOrders";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AVATAR = require("../../../assets/images/3davatar.png");

// ─────────────────────────────────────────────────────────────
// TYPES & CONSTANTS
// ─────────────────────────────────────────────────────────────

type Tab = "new" | "active" | "approved";
type OrderStatus = "NEW" | "PROCESSING" | "COMPLETED" | "CANCELLED";

interface Order {
  id: string;
  retailerName: string;
  location: string;
  phone: string;
  orderId: string;
  date: string;
  time: string;
  deliveryDate: string;   // ← ajouter
  deliveryTime: string;
  paymentType: string;
  totalShipmentItems: string;
  totalQty: string;
  total: string;
  status: OrderStatus;
  isNewBuyer: boolean;
  expanded: boolean;
  orderTimestamp: number;
  approvedTimestamp: number | null;
  approvedDate?: string;
  approvedTime?: string;
}

const FILTERS = ["A-Z", "Most Ordered", "Recent", "This Month"];

const TABS: { key: Tab; label: string }[] = [
  { key: "new", label: "New Requests" },
  { key: "active", label: "Active" },
  { key: "approved", label: "Approved" },
];

// Backend filter values (approved tab still uses the DELIVERED filter)
const FILTER_VALUE: Record<Tab, string> = {
  new: "NEW",
  active: "ACTIVE",
  approved: "DELIVERED",
};

const ORDER_STATUS_STYLES: Record<
  OrderStatus,
  { label: string; bg: string; color: string }
> = {
  NEW: { label: "New", bg: "#DBEAFE", color: "#1D4ED8" },
  PROCESSING: { label: "Processing", bg: "#FEF3C7", color: "#B45309" },
  COMPLETED: { label: "Approved", bg: "#DCFCE7", color: "#15803D" },
  CANCELLED: { label: "Cancelled", bg: "#FEE2E2", color: "#B91C1C" },
};

const normalizeStatus = (s?: string): OrderStatus => {
  if (s === "PROCESSING") return "PROCESSING";
  if (s === "CANCELLED") return "CANCELLED";
  if (s === "COMPLETED" || s === "APPROVED" || s === "DELIVERED") return "COMPLETED";
  return "NEW";
};

// ─────────────────────────────────────────────────────────────
// SCREEN
// ─────────────────────────────────────────────────────────────

export default function OrderRequestScreen() {
  const [selectedTab, setSelectedTab] = useState<Tab>("new");
  const [selectedFilter, setSelectedFilter] = useState<string | null>("Recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"aggregate" | "retailer">("retailer");

  const [orders, setOrders] = useState<Record<Tab, Order[]>>({
    new: [],
    active: [],
    approved: [],
  });

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchOrders = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        const supplierId = await secureStorage.getItem("userId");
        if (!supplierId) return;

        const res = await axiosInstance.get(
          `/api/orders/supplier/${supplierId}/filter`,
          { params: { filter: FILTER_VALUE[selectedTab] } }
        );

        const mapOrder = (raw: any): Order => {
          let date = "";
          let time = "";
          try {
            const d = new Date(raw.orderDate || raw.createdAt);
            date = d.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            time = d.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            });
          } catch {
            date = raw.orderDate || "";
          }

          const subtotal =
            raw.subtotal ??
            raw.items?.reduce(
              (sum: number, i: any) => sum + i.requestedQuantity * i.unitPrice,
              0
            ) ??
            0;
          const grandTotal = raw.grandTotal ?? subtotal + subtotal * 0.05;

          const totalQty =
            raw.items?.reduce(
              (sum: number, i: any) =>
                sum + (i.edited ? i.fulfilledQuantity : i.requestedQuantity),
              0
            ) ?? 0;
const deliveryDate = raw.deliveryDate
  ? new Date(raw.deliveryDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  : "N/A";
          return {
            id: String(raw.id || raw.orderId),
            retailerName: raw.retailerName || raw.shopName || "Retailer",
            location: raw.retailerAddress
              ? raw.retailerAddress.split(",")[1]?.trim() ?? ""
              : "",
            phone:
              raw.retailerPhoneNumber ||
              raw.contactNumber ||
              raw.phone ||
              raw.mobile ||
              raw.phoneNumber ||
              "",
            orderId: `#${String(raw.id || "").slice(0, 8).toUpperCase()}`,
            date,
            time,
            deliveryDate,
            deliveryTime: raw.deliveryTimeSlot || raw.deliveryTime || "N/A",
            paymentType:"Cash on Delivery",
            totalShipmentItems: `${raw.items?.length ?? 0} Items`,
            totalQty: `${totalQty} Kg`,
            total: `₹${grandTotal.toLocaleString("en-IN")}`,
            status: normalizeStatus(raw.status),
            isNewBuyer: raw.isNewBuyer ?? false,
            expanded: false,
            orderTimestamp: new Date(raw.orderDate || raw.createdAt).getTime(),
            approvedTimestamp: raw.approvedAt ? new Date(raw.approvedAt).getTime() : null,
            approvedDate: raw.approvedAt ? fmtDate(raw.approvedAt) : undefined,
            approvedTime: raw.approvedAt ? fmtTime(raw.approvedAt) : undefined,
          };
        };

        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.content || res.data?.data || [];

        setOrders((prev) => ({ ...prev, [selectedTab]: list.map(mapOrder) }));
      } catch (err: any) {
        console.log("fetchOrders error:", err?.response?.status, err?.response?.data);
        setError("Failed to load orders. Please try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedTab]
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const toggleAccordion = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOrders((prev) => ({
      ...prev,
      [selectedTab]: prev[selectedTab].map((o) =>
        o.id === id ? { ...o, expanded: !o.expanded } : o
      ),
    }));
  };

const currentOrders = orders[selectedTab]
  .filter((o) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      o.retailerName.toLowerCase().includes(q) ||
      o.orderId.toLowerCase().includes(q) ||
      o.phone.includes(q)
    );
  })
  .sort((a, b) => {
    if (selectedTab === "approved") {
      // orders without approvedAt fall back to their order date
      const aTime = a.approvedTimestamp ?? a.orderTimestamp;
      const bTime = b.approvedTimestamp ?? b.orderTimestamp;
      return bTime - aTime;
    }
    return b.orderTimestamp - a.orderTimestamp;
  });
  // ───────────────────────── ORDER CARD (same as retailer) ─────────────────────────
const renderCard = ({ item }: { item: Order }) => {
  const isNewTab = selectedTab === "new";
  const statusStyle = ORDER_STATUS_STYLES[item.status];

  const chip = {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  } as const;

  const detailRows: [string, string][] = [
    ["Payment Type", item.paymentType],
    ["Total Shipment Items", item.totalShipmentItems],
    ["Total Quantity (weight)", item.totalQty],
  ];

  const goToDetails = () =>
    router.push({
      pathname: "/(supplier)/orderDetails",
      params: { orderId: item.id },
    });

    const goToInvoice = async () => {
  const inv = await getInvoiceByOrderId(item.id);
  if (!inv) {
    Alert.alert("Invoice not found", "No invoice exists for this order yet.");
    return;
  }
  router.push({
    pathname: "/invoiceDetails",
    params: { invoiceId: inv.id, retailerName: item.retailerName },
  });
};

return (
  <View
    style={{
      backgroundColor: "#fff",
      borderRadius: 18,
      padding: 14,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: "#ECECEC",
    }}
  >
    {/* TOP: avatar + name + location/phone */}
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Image
        source={AVATAR}
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          marginRight: 12,
          backgroundColor: "#D1FAE5",
        }}
      />
      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={2}
          style={{ fontSize: 16, fontWeight: "600", color: "#1F2937" }}
        >
          {item.retailerName}
        </Text>

        {(!!item.location || !!item.phone) && (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 6,
              marginTop: 4,
            }}
          >
            {!!item.location && (
              <View style={chip}>
                <Text style={{ fontSize: 10, color: "#6B7280" }}>{item.location}</Text>
              </View>
            )}
            {!!item.phone && (
              <View style={chip}>
                <Text style={{ fontSize: 10, color: "#6B7280" }}>{item.phone}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>

    {/* NEW BUYER (new tab only) */}
    {isNewTab && item.isNewBuyer && (
      <View
        style={{
          ...chip,
          alignSelf: "flex-start",
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
          marginTop: 8,
        }}
      >
        <View
          style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#15803D" }}
        />
        <Text style={{ color: "#1F2937", fontSize: 11, fontWeight: "700" }}>
          New Buyer
        </Text>
      </View>
    )}

    {/* ORDER ID + COPY + STATUS (same line) */}
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 10,
      }}
    >
      {!isNewTab ? (
        <View style={{ flexDirection: "row", alignItems: "center", flexShrink: 1 }}>
          <Text style={{ fontSize: 9, color: "#9CA3AF", marginRight: 6 }}>
            Latest Order Id
          </Text>
          <Text
            numberOfLines={1}
            style={{ fontSize: 11, fontWeight: "700", color: "#111827", maxWidth: 110 }}
          >
            {item.orderId}
          </Text>
          <TouchableOpacity
            style={{ marginLeft: 4, padding: 4 }}
            onPress={async () => {
              try {
                await Clipboard.setStringAsync(item.orderId);
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
      ) : (
        <View />
      )}

      {/* STATUS BADGE */}
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
      <Text style={{ fontSize: 20, fontWeight: "700", color: "#0C5217" }}>{item.total}</Text>
    </View>

    {/* ACTIONS */}
    {isNewTab ? (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={goToDetails}
        style={{
          backgroundColor: "#2E7D32",
          paddingVertical: 12,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "500", fontSize: 14 }}>
          View Order Details
        </Text>
      </TouchableOpacity>
    ) : (
<View style={{ flexDirection: "row", gap: 10 }}>
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={goToDetails}
    style={{ flex: 1, backgroundColor: "#F1F5EC", paddingVertical: 12, borderRadius: 12, alignItems: "center" }}
  >
    <Text style={{ color: "#2E7D32", fontWeight: "500", fontSize: 14 }}>Order Details</Text>
  </TouchableOpacity>

  {item.status === "COMPLETED" && (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={goToInvoice}
      style={{ flex: 1, backgroundColor: "#2E7D32", paddingVertical: 12, borderRadius: 12, alignItems: "center" }}
    >
      <Text style={{ color: "#fff", fontWeight: "500", fontSize: 14 }}>View Invoice</Text>
    </TouchableOpacity>
  )}
</View>
    )}
  </View>
);

};
  // ───────────────────────── RENDER ─────────────────────────

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* TOP TOGGLE */}
      <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
        <View
          style={{
            backgroundColor: "#ECEDEE",
            borderRadius: 12,
            flexDirection: "row",
            padding: 3,
            marginBottom: 12,
            marginTop: 10,
            height: 45,
          }}
        >
          {(
            [
              { key: "aggregate", label: "Aggregate" },
              { key: "retailer", label: "Retailer Orders" },
            ] as const
          ).map((m) => (
            <TouchableOpacity
              key={m.key}
              onPress={() => setViewMode(m.key)}
              style={{
                flex: 1,
                backgroundColor: viewMode === m.key ? "#fff" : "transparent",
                paddingVertical: 9,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: viewMode === m.key ? "#2E7D32" : "#353637",
                  fontWeight: "600",
                  fontSize: 13,
                }}
              >
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* LIST */}
      {viewMode === "aggregate" ? (
  <AggregateOrders />
) : 
      loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#15803D" />
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <Text style={{ color: "#EF4444", textAlign: "center", marginBottom: 16 }}>{error}</Text>
          <TouchableOpacity
            onPress={() => fetchOrders()}
            style={{
              backgroundColor: "#15803D",
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={currentOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchOrders(true)}
              colors={["#15803D"]}
            />
          }
          ListHeaderComponent={
            <View>
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

              {/* STATUS TABS */}
              <View style={{ flexDirection: "row", marginBottom: 18 }}>
                {TABS.map((tab, idx) => {
                  const active = selectedTab === tab.key;
                  return (
                    <TouchableOpacity
                      key={tab.key}
                      onPress={() => setSelectedTab(tab.key)}
                      style={{
                        marginRight: idx < TABS.length - 1 ? 24 : 0,
                        borderBottomWidth: active ? 2 : 0,
                        borderBottomColor: "#15803D",
                        paddingBottom: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: active ? "#15803D" : "#4B5563",
                          fontWeight: active ? "700" : "500",
                        }}
                      >
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* FILTER CHIPS */}
              <View style={{ marginBottom: 18 }}>
                <FlatList
                  horizontal
                  data={FILTERS}
                  keyExtractor={(f) => f}
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item: chip }) => {
                    const isActive = selectedFilter === chip;
                    return (
                      <TouchableOpacity
                        onPress={() => setSelectedFilter(isActive ? null : chip)}
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
                  }}
                />
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 60 }}>
              <MaterialCommunityIcons name="package-variant" size={64} color="#D1D5DB" />
              <Text style={{ color: "#9CA3AF", marginTop: 16, fontSize: 16 }}>
                No {selectedTab} orders
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
