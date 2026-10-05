import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import axiosInstance from "@/lib/api/axiosConfig";
import { secureStorage } from "@/lib/secureStorage";

// ─────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────

// "Low stock" alert: what is left AFTER fulfilling the day's orders is <= this.
const LOW_STOCK_REMAINING = 10;

// Temporary UI preview mode.
// Set to false when you want to use the real API again.
const USE_MOCK_DATA = true;

// TODO: confirm the real endpoint that returns the supplier's products with stock.
const stockUrl = (supplierId: string) => `/api/products/supplier/${supplierId}`;

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

type StockState = "OUT" | "SHORT" | "LOW" | "OK" | "UNKNOWN";

type Line = {
  dayKey: string; // YYYY-MM-DD (delivery day)
  productKey: string;
  name: string;
  unit: string;
  qty: number;
};

type Row = {
  productKey: string;
  name: string;
  unit: string;
  ordered: number;
  available: number | null; // null = stock unknown
  state: StockState;
  shortBy: number;
};

const STATE_STYLE: Record<StockState, { bg: string; color: string }> = {
  OUT: { bg: "#FEE2E2", color: "#B91C1C" },
  SHORT: { bg: "#FFEDD5", color: "#C2410C" },
  LOW: { bg: "#FEF3C7", color: "#B45309" },
  OK: { bg: "#DCFCE7", color: "#15803D" },
  UNKNOWN: { bg: "#F3F4F6", color: "#6B7280" },
};

const STATE_ORDER: Record<StockState, number> = { OUT: 0, SHORT: 1, LOW: 2, UNKNOWN: 3, OK: 4 };

// ─────────────────────────────────────────────────────────────
// DATE HELPERS
// ─────────────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, "0");
const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// "2026-10-01" must stay on that local day (no timezone shift).
const parseDate = (v: any): Date | null => {
  if (!v) return null;
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
    const [y, m, d] = v.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
};

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

const startOfWeek = (d: Date) => addDays(d, -((d.getDay() + 6) % 7)); // Monday

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const longDay = (d: Date) =>
  `${ordinal(d.getDate())} ${d.toLocaleDateString("en-US", { month: "short" })} ${d.getFullYear()}, ${d.toLocaleDateString("en-US", { weekday: "long" })}`;

const fmtQty = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

// ─────────────────────────────────────────────────────────────
// DATA HELPERS
// ─────────────────────────────────────────────────────────────

const toList = (res: any): any[] =>
  Array.isArray(res?.data) ? res.data : res?.data?.content || res?.data?.data || [];

const buildLines = (orders: any[]): Line[] => {
  const lines: Line[] = [];
  orders.forEach((o) => {
    const day = parseDate(o.deliveryDate ?? o.orderDate ?? o.createdAt);
    if (!day) return;
    (o.items ?? []).forEach((i: any) => {
      const name = i.productName || i.name || i.product?.name || "Product";
      const qty = Number(i.edited ? i.fulfilledQuantity : i.requestedQuantity) || 0;
      if (qty <= 0) return;
      lines.push({
        dayKey: toKey(day),
        productKey: String(i.productId ?? i.product?.id ?? name.toLowerCase()),
        name,
        unit: i.unit || "kg",
        qty,
      });
    });
  });
  return lines;
};

// Returns Map(key -> available quantity). Keys: product id and lowercase name.
const fetchStock = async (supplierId: string): Promise<Map<string, number> | null> => {
  try {
    const res = await axiosInstance.get(stockUrl(supplierId));
    const map = new Map<string, number>();
    toList(res).forEach((p: any) => {
      const q = Number(p.availableQuantity ?? p.stockQuantity ?? p.stock ?? p.quantity);
      if (isNaN(q)) return;
      if (p.id != null) map.set(String(p.id), q);
      if (p.productId != null) map.set(String(p.productId), q);
      const n = p.name || p.productName;
      if (n) map.set(String(n).toLowerCase(), q);
    });
    return map;
  } catch (e: any) {
    console.log("aggregate stock error:", e?.response?.status);
    return null; // screen still works, stock shown as unavailable
  }
};

const aggregateDay = (lines: Line[], dayKey: string, stock: Map<string, number> | null): Row[] => {
  const byProduct = new Map<string, Row>();

  lines
    .filter((l) => l.dayKey === dayKey)
    .forEach((l) => {
      const r = byProduct.get(l.productKey);
      if (r) r.ordered += l.qty;
      else
        byProduct.set(l.productKey, {
          productKey: l.productKey,
          name: l.name,
          unit: l.unit,
          ordered: l.qty,
          available: null,
          state: "UNKNOWN",
          shortBy: 0,
        });
    });

  const rows = Array.from(byProduct.values()).map((r) => {
    const available = stock ? stock.get(r.productKey) ?? stock.get(r.name.toLowerCase()) ?? null : null;
    let state: StockState = "UNKNOWN";
    let shortBy = 0;

    if (available !== null) {
      if (available <= 0) state = "OUT";
      else if (available < r.ordered) {
        state = "SHORT";
        shortBy = r.ordered - available;
      } else if (available - r.ordered <= LOW_STOCK_REMAINING) state = "LOW";
      else state = "OK";
    }
    return { ...r, available, state, shortBy };
  });

  return rows.sort(
    (a, b) => STATE_ORDER[a.state] - STATE_ORDER[b.state] || a.name.localeCompare(b.name)
  );
};

const badgeText = (r: Row): string => {
  switch (r.state) {
    case "OUT":
      return "Out of stock";
    case "SHORT":
      return `Short by ${fmtQty(r.shortBy)} ${r.unit}`;
    case "LOW":
      return "Low stock";
    case "OK":
      return "In stock";
    default:
      return "Stock unavailable";
  }
};
const MOCK_AGGREGATE_PRODUCTS: Row[] = [
  {
    productKey: "tomato",
    name: "Tomato",
    unit: "kg",
    ordered: 85,
    available: 120,
    state: "OK",
    shortBy: 0,
  },
  {
    productKey: "potato",
    name: "Potato",
    unit: "kg",
    ordered: 140,
    available: 95,
    state: "SHORT",
    shortBy: 45,
  },
  {
    productKey: "onion",
    name: "Onion",
    unit: "kg",
    ordered: 65,
    available: 65,
    state: "LOW",
    shortBy: 0,
  },
  {
    productKey: "carrot",
    name: "Carrot",
    unit: "kg",
    ordered: 40,
    available: 0,
    state: "OUT",
    shortBy: 40,
  },
  {
    productKey: "cucumber",
    name: "Cucumber",
    unit: "kg",
    ordered: 30,
    available: 55,
    state: "OK",
    shortBy: 0,
  },
  {
    productKey: "bell-pepper",
    name: "Bell Pepper",
    unit: "kg",
    ordered: 25,
    available: 32,
    state: "OK",
    shortBy: 0,
  },
];
// ─────────────────────────────────────────────────────────────
// SCREEN CONTENT (rendered under the Aggregate / Retailer Orders toggle)
// ─────────────────────────────────────────────────────────────

export default function AggregateOrders() {
  const [lines, setLines] = useState<Line[]>([]);
  const [stock, setStock] = useState<Map<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Used only while USE_MOCK_DATA is true.
  const [mockRows, setMockRows] = useState<Row[]>([]);

  const [selected, setSelected] = useState<Date>(() => new Date());
  const [onlyIssues, setOnlyIssues] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const supplierId = await secureStorage.getItem("userId");

      if (USE_MOCK_DATA) {
        setMockRows(MOCK_AGGREGATE_PRODUCTS);
        setStock(new Map<string, number>());
        return;
      }

      if (!supplierId) return;

      // Orders still to deliver: new requests + active ones
      const [newRes, activeRes, stockMap] = await Promise.all([
        axiosInstance.get(`/api/orders/supplier/${supplierId}/filter`, { params: { filter: "NEW" } }),
        axiosInstance.get(`/api/orders/supplier/${supplierId}/filter`, { params: { filter: "ACTIVE" } }),
        fetchStock(supplierId),
      ]);

      const byId = new Map<string, any>();
      [...toList(newRes), ...toList(activeRes)].forEach((o) => byId.set(String(o.id ?? o.orderId), o));

      setLines(buildLines(Array.from(byId.values())));
      setStock(stockMap);
    } catch (err: any) {
      console.log("aggregate load error:", err?.response?.status, err?.response?.data);
      setError("Failed to load aggregate orders. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // ── Week strip ──
  const weekStart = startOfWeek(selected);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const selectedKey = toKey(selected);
  const todayKey = toKey(new Date());

  const dayInfo = useMemo(() => {
    const info: Record<string, { count: number; issue: boolean }> = {};
    weekDays.forEach((d) => {
      const k = toKey(d);
      const rows = USE_MOCK_DATA
        ? k === toKey(new Date())
          ? MOCK_AGGREGATE_PRODUCTS
          : []
        : aggregateDay(lines, k, stock);

      info[k] = {
        count: rows.length,
        issue: rows.some((r) => r.state === "OUT" || r.state === "SHORT"),
      };
    });
    return info;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines, stock, selectedKey]);

  // ── Selected day ──
  const rows = useMemo(
    () => (USE_MOCK_DATA ? mockRows : aggregateDay(lines, selectedKey, stock)),
    [lines, stock, selectedKey, mockRows]
  );
  const attention = rows.filter((r) => r.state === "OUT" || r.state === "SHORT" || r.state === "LOW");
  const visibleRows = onlyIssues ? attention : rows;
  const blocking = rows.filter((r) => r.state === "OUT" || r.state === "SHORT").length;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#15803D" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ color: "#EF4444", textAlign: "center", marginBottom: 16 }}>{error}</Text>
        <TouchableOpacity
          onPress={() => load()}
          style={{ backgroundColor: "#15803D", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={["#15803D"]} />
      }
    >
      {/* WEEK STRIP */}
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#ECECEC",
          paddingVertical: 12,
          paddingHorizontal: 8,
          marginBottom: 20,
        }}
      >
        <Text style={{ textAlign: "center", fontSize: 12, fontWeight: "600", color: "#1F2937", marginBottom: 10 }}>
          {selected.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => setSelected(addDays(selected, -7))} hitSlop={10} style={{ padding: 4 }}>
            <Feather name="chevron-left" size={18} color="#6B7280" />
          </TouchableOpacity>

          <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-around" }}>
            {weekDays.map((d) => {
              const k = toKey(d);
              const active = k === selectedKey;
              const info = dayInfo[k];
              return (
                <TouchableOpacity
                  key={k}
                  onPress={() => setSelected(d)}
                  activeOpacity={0.7}
                  style={{
                    alignItems: "center",
                    paddingVertical: 6,
                    paddingHorizontal: 6,
                    borderRadius: 10,
                    backgroundColor: active ? "#F1F5EC" : "transparent",
                  }}
                >
                  <Text style={{ fontSize: 9, color: "#9CA3AF", fontWeight: "600" }}>
                    {d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()}
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      marginTop: 2,
                      color: active ? "#15803D" : k === todayKey ? "#2E7D32" : "#111827",
                    }}
                  >
                    {d.getDate()}
                  </Text>
                  {/* dot: green = orders that day, red = stock problem that day */}
                  <View
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: 3,
                      marginTop: 4,
                      backgroundColor: info?.issue ? "#DC2626" : info?.count ? "#2E7D32" : "transparent",
                    }}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity onPress={() => setSelected(addDays(selected, 7))} hitSlop={10} style={{ padding: 4 }}>
            <Feather name="chevron-right" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* TITLE */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 17, fontWeight: "700", color: "#111827" }}>Order Details</Text>
        {USE_MOCK_DATA && (
          <View style={{ backgroundColor: "#F3E8FF", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 }}>
            <Text style={{ color: "#7E22CE", fontSize: 9, fontWeight: "700" }}>PREVIEW</Text>
          </View>
        )}
      </View>
      <Text style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2, marginBottom: 14 }}>
        Delivering on : {longDay(selected)}
      </Text>

      {/* AGGREGATE SUMMARY */}
      {rows.length > 0 && (
        <>
          <View style={{ flexDirection: "row", marginBottom: 12 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: "#fff",
                borderWidth: 1,
                borderColor: "#ECECEC",
                borderRadius: 14,
                padding: 14,
                marginRight: 6,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MaterialCommunityIcons name="package-variant" size={18} color="#15803D" />
                <Text style={{ marginLeft: 7, fontSize: 12, color: "#6B7280", fontWeight: "600" }}>
                  Products
                </Text>
              </View>
              <Text style={{ marginTop: 7, fontSize: 22, fontWeight: "800", color: "#111827" }}>
                {rows.length}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: attention.length > 0 ? "#FFF7ED" : "#F0FDF4",
                borderWidth: 1,
                borderColor: attention.length > 0 ? "#FED7AA" : "#BBF7D0",
                borderRadius: 14,
                padding: 14,
                marginLeft: 6,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Feather
                  name={attention.length > 0 ? "alert-circle" : "check-circle"}
                  size={17}
                  color={attention.length > 0 ? "#C2410C" : "#15803D"}
                />
                <Text
                  style={{
                    marginLeft: 7,
                    fontSize: 12,
                    color: attention.length > 0 ? "#9A3412" : "#166534",
                    fontWeight: "600",
                  }}
                >
                  Needs attention
                </Text>
              </View>
              <Text
                style={{
                  marginTop: 7,
                  fontSize: 22,
                  fontWeight: "800",
                  color: attention.length > 0 ? "#C2410C" : "#15803D",
                }}
              >
                {attention.length}
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderRadius: 12,
              padding: 12,
              marginBottom: 14,
              backgroundColor:
                stock === null
                  ? "#F3F4F6"
                  : blocking > 0
                  ? "#FEE2E2"
                  : attention.length > 0
                  ? "#FEF3C7"
                  : "#DCFCE7",
            }}
          >
            <Feather
              name={
                stock === null
                  ? "info"
                  : blocking > 0
                  ? "alert-triangle"
                  : attention.length > 0
                  ? "alert-circle"
                  : "check-circle"
              }
              size={16}
              color={
                stock === null
                  ? "#6B7280"
                  : blocking > 0
                  ? "#B91C1C"
                  : attention.length > 0
                  ? "#B45309"
                  : "#15803D"
              }
            />
            <Text
              style={{
                flex: 1,
                marginLeft: 8,
                fontSize: 12,
                fontWeight: "500",
                color:
                  stock === null
                    ? "#6B7280"
                    : blocking > 0
                    ? "#B91C1C"
                    : attention.length > 0
                    ? "#B45309"
                    : "#15803D",
              }}
            >
              {stock === null
                ? "Stock information is not available right now."
                : blocking > 0
                ? `${blocking} product${blocking > 1 ? "s" : ""} can't be fully covered by your stock.`
                : attention.length > 0
                ? `${attention.length} product${attention.length > 1 ? "s" : ""} need attention before delivery.`
                : "All ordered products are available in stock."}
            </Text>
          </View>
        </>
      )}

      {/* FILTER CHIPS */}
      {rows.length > 0 && stock !== null && (
        <View style={{ flexDirection: "row", marginBottom: 14 }}>
          {[
            { label: "All", value: false },
            { label: `Needs attention (${attention.length})`, value: true },
          ].map((c) => {
            const active = onlyIssues === c.value;
            return (
              <TouchableOpacity
                key={c.label}
                onPress={() => setOnlyIssues(c.value)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: active ? "#9333EA" : "#F3E8FF",
                  marginRight: 10,
                }}
              >
                <Text style={{ color: active ? "#fff" : "#9333EA", fontSize: 13, fontWeight: "600" }}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* PRODUCT LIST */}
      {visibleRows.length === 0 ? (
        <View style={{ alignItems: "center", marginTop: 50 }}>
          <MaterialCommunityIcons name="package-variant" size={64} color="#D1D5DB" />
          <Text style={{ color: "#9CA3AF", marginTop: 16, fontSize: 15, textAlign: "center" }}>
            {rows.length === 0 ? "No orders to deliver on this day" : "No products need attention"}
          </Text>
        </View>
      ) : (
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#ECECEC",
            paddingHorizontal: 14,
          }}
        >
          {visibleRows.map((r, idx) => {
            const st = STATE_STYLE[r.state];
            const icon =
              r.productKey === "tomato"
                ? "food-variant"
                : r.productKey === "potato"
                ? "food"
                : r.productKey === "onion"
                ? "circle-outline"
                : r.productKey === "carrot"
                ? "carrot"
                : r.productKey === "cucumber"
                ? "leaf"
                : "pepper";

            return (
              <View
                key={r.productKey}
                style={{
                  paddingVertical: 15,
                  borderTopWidth: idx === 0 ? 0 : 1,
                  borderTopColor: "#F3F4F6",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#F1F5EC",
                      marginRight: 12,
                    }}
                  >
                    <MaterialCommunityIcons name={icon as any} size={22} color="#15803D" />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}>
                      {r.name}
                    </Text>
                    <Text style={{ fontSize: 11, color: "#9CA3AF", marginTop: 3 }}>
                      Total required for this delivery
                    </Text>
                  </View>

                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ fontSize: 17, fontWeight: "800", color: "#111827" }}>
                      {fmtQty(r.ordered)} {r.unit}
                    </Text>
                    <Text style={{ fontSize: 10, color: "#6B7280", marginTop: 2 }}>
                      Ordered
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 12,
                    marginLeft: 54,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10, color: "#9CA3AF", fontWeight: "600" }}>
                      AVAILABLE
                    </Text>
                    <Text style={{ fontSize: 13, color: "#374151", fontWeight: "700", marginTop: 2 }}>
                      {r.available === null ? "—" : `${fmtQty(r.available)} ${r.unit}`}
                    </Text>
                  </View>

                  {r.state === "SHORT" && (
                    <Text style={{ fontSize: 11, color: "#C2410C", fontWeight: "700", marginRight: 10 }}>
                      -{fmtQty(r.shortBy)} {r.unit}
                    </Text>
                  )}

                  <View
                    style={{
                      backgroundColor: st.bg,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 12,
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: "700", color: st.color }}>
                      {badgeText(r)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}