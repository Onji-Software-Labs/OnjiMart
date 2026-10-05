import React, { useCallback, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { getRetailerInvoices, InvoiceItem } from "@/lib/api/invoice";
import { secureStorage } from "@/lib/secureStorage";
import { formatINR, displayStatus, fmtDate, fmtTime, refId } from "@/lib/invoiceFormat";

const APPROVED_STATUSES = ["APPROVED", "PENDING", "GENERATED"];

// Backend currently returns totalPrice = 0 on generated invoices.
// Fallback: subtotal + GST + delivery charge.
const invoiceTotal = (i: any): number => {
  const t = Number(i?.totalPrice ?? 0);
  if (t > 0) return t;
  return Number(i?.subtotal ?? 0) + Number(i?.gstAmount ?? 0) + Number(i?.deliveryCharge ?? 0);
};

const pick = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);

// Must stay identical to getSupplierName in the Invoice screen,
// otherwise the key computed here won't match the group key passed in params.
const supplierNameOf = (i: any): string =>
  i?.supplierBusinessName ||
  i?.supplierName ||
  i?.supplier?.businessName ||
  i?.supplier?.name ||
  "Unknown Supplier";

export default function SupplierInvoices() {
  const params = useLocalSearchParams<{ supplierKey?: string; supplierName?: string }>();
  const supplierKey = pick(params.supplierKey);
  const supplierName = pick(params.supplierName) ?? "Supplier";

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          setLoading(true);
          const retailerId = await secureStorage.getItem("userId");
          if (!retailerId) return; // finally still runs, so the spinner stops

          const data = await getRetailerInvoices(retailerId);
          const mine = (data ?? [])
            .filter((i: any) => APPROVED_STATUSES.includes(i.status?.toUpperCase()))
            .filter((i: any) => String(i.supplierId ?? supplierNameOf(i)) === supplierKey)
            .sort(
              (a, b) =>
                new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()
            );
          if (active) setItems(mine);
        } catch (err) {
          console.warn("Could not retrieve invoices from backend.", err);
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [supplierKey])
  );

  const total = items.reduce((s, i) => s + invoiceTotal(i), 0);

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16, backgroundColor: "#fff" }}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center" }}>
          <Feather name="arrow-left" size={20} color="#2A6B2D" />
          <Text numberOfLines={1} style={{ fontSize: 18, fontWeight: "600", color: "#2A6B2D", marginLeft: 8, flex: 1 }}>
            {supplierName}
          </Text>
        </TouchableOpacity>
        {!loading && (
          <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 6 }}>
            {items.length} invoice{items.length !== 1 ? "s" : ""} • Total {formatINR(total)}
          </Text>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => String(i.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", color: "#6B7280", marginTop: 40 }}>No invoices found.</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/invoiceDetails",
                  params: { invoiceId: item.id, supplierName },
                })
              }
              style={{
                backgroundColor: "#fff",
                borderRadius: 14,
                padding: 14,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: "#F3F4F6",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#2A6B2D", marginRight: 6 }} />
                  <Text style={{ fontSize: 12, color: "#2A6B2D", fontWeight: "500" }}>
                    {displayStatus(item.status)}
                  </Text>
                </View>
                <Text style={{ fontSize: 11, color: "#6B7280", marginTop: 6 }}>
                  {fmtDate(item.invoiceDate)}  •  {fmtTime(item.invoiceDate)}
                </Text>
                <Text style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}>
                  Order Id{"  "}
                  <Text style={{ fontWeight: "600", color: "#111827" }}>{refId(item)}</Text>
                </Text>
              </View>
              <Text style={{ fontSize: 17, fontWeight: "700", color: "#111827", marginRight: 8 }}>
                {formatINR(invoiceTotal(item))}
              </Text>
              <Feather name="chevron-right" size={14} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}