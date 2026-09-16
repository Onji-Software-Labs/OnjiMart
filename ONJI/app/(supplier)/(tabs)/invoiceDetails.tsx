import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Share,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { getInvoiceById, InvoiceDetailsResponse } from "@/lib/api/invoice";

// Supplier-side Invoice Details screen.
// Uses the SAME endpoint as the retailer version: GET /api/invoices/{invoiceId}
// via getInvoiceById(invoiceId). The only differences from the retailer screen
// are which party's info is shown (Retailer instead of Supplier) and the
// removed "Rate your order" banner, which doesn't apply to a supplier viewing
// their own outgoing invoice.

export default function SupplierInvoiceDetails() {
  const params = useLocalSearchParams<{ invoiceId?: string | string[]; retailerName?: string | string[] }>();
  const invoiceId = Array.isArray(params.invoiceId) ? params.invoiceId[0] : params.invoiceId;
  // Name passed over from the list screen (real name or "Retailer Name N"
  // substitute) — used so both screens always agree on what to show.
  const retailerNameParam = Array.isArray(params.retailerName) ? params.retailerName[0] : params.retailerName;

  const [invoice, setInvoice] = useState<InvoiceDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchInvoice = async () => {
      if (!invoiceId) {
        if (isMounted) {
          setLoadError("Missing invoice id in navigation params.");
          setLoading(false);
        }
        return;
      }
      setLoading(true);
      setLoadError(null);
      try {
        const data = await getInvoiceById(invoiceId);
        if (isMounted) {
          if (!data) {
            setLoadError("Invoice not found.");
          }
          setInvoice(data ?? null);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setLoadError(err?.message || "Request failed.");
          setInvoice(null);
          setLoading(false);
        }
      }
    };

    fetchInvoice();
    return () => {
      isMounted = false;
    };
  }, [invoiceId]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F9FAFB" }}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  if (!invoice) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingTop: 50,
            paddingBottom: 16,
            backgroundColor: "#FFFFFF",
          }}
        >
          <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center" }}>
            <Feather name="arrow-left" size={20} color="#2A6B2D" />
            <Text style={{ fontSize: 18, fontWeight: "600", color: "#2A6B2D", marginLeft: 8 }}>
              Invoice Details
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
          <Text style={{ fontSize: 14, color: "#6B7280", textAlign: "center" }}>
            Couldn't load this invoice. Please go back and try again.
          </Text>
          {loadError && (
            <Text style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center", marginTop: 8 }}>
              {loadError}
            </Text>
          )}
        </View>
      </View>
    );
  }

  const items = invoice.invoiceOrderItems ?? [];
  const subtotal = invoice.totalPrice ?? 0;
  const deliveryCharge = invoice.deliveryCharge ?? 0;
  const grandTotal = subtotal + deliveryCharge;

  const orderDate = invoice.invoiceDate ? new Date(invoice.invoiceDate) : null;
  const formattedDate = orderDate
    ? orderDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "N/A";
  const formattedTime = orderDate
    ? orderDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : "";

  const lastUpdated = invoice.dateModified ? new Date(invoice.dateModified) : null;
  const formattedLastUpdated = lastUpdated
    ? lastUpdated.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "N/A";

  const shortId = invoice.id ? `#INV-${invoice.id.slice(0, 6).toUpperCase()}` : "—";

  // Prefer a real name straight from this invoice's own response (in case
  // the backend adds retailerBusinessName to this endpoint later), then the
  // name carried over from the list screen, then a plain fallback.
  const displayRetailerName =
    (invoice as any).retailerBusinessName || retailerNameParam || "Retailer";

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Invoice ${shortId} for ₹${grandTotal}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleDownload = () => {
    // PDF download action
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: 50,
          paddingBottom: 16,
          backgroundColor: "#FFFFFF",
        }}
      >
        <TouchableOpacity onPress={() => router.push("/invoice")} style={{ flexDirection: "row", alignItems: "center" }}>
          <Feather name="arrow-left" size={20} color="#2A6B2D" />
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#2A6B2D", marginLeft: 8 }}>
            Invoice Details
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Transaction Info Card */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: "#F3F4F6",
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: "#9CA3AF" }}>Transaction ID</Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#181D18" }}>{shortId}</Text>
                <Feather name="copy" size={12} color="#2E7D32" style={{ marginLeft: 4 }} />
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#2A6B2D", marginRight: 4 }} />
                <Text style={{ fontSize: 12, color: "#2A6B2D", fontWeight: "600" }}>{invoice.status}</Text>
              </View>
            </View>

            <View style={{ flex: 1, borderLeftWidth: 1, borderLeftColor: "#F3F4F6", paddingLeft: 12 }}>
              <Text style={{ fontSize: 11, color: "#9CA3AF" }}>Order Placed</Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#181D18" }}>{formattedDate}</Text>
                <Feather name="calendar" size={12} color="#2E7D32" style={{ marginLeft: 4 }} />
              </View>
              <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 6 }}>{formattedTime}</Text>
            </View>

            <View style={{ flex: 1, borderLeftWidth: 1, borderLeftColor: "#F3F4F6", paddingLeft: 12 }}>
              <Text style={{ fontSize: 11, color: "#9CA3AF" }}>Last Updated</Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#181D18" }}>{formattedLastUpdated}</Text>
                <Feather name="refresh-cw" size={12} color="#2E7D32" style={{ marginLeft: 4 }} />
              </View>
            </View>
          </View>
        </View>

        {/* Invoice Items */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            padding: 16,
            marginTop: 16,
            borderWidth: 1,
            borderColor: "#F3F4F6",
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#6B7280", marginBottom: 8 }}>
            Invoice Items
          </Text>

          {items.length > 0 ? (
            items.map((item, idx) => (
              <View
                key={item.id || idx}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 12,
                  borderTopWidth: idx === 0 ? 0 : 1,
                  borderTopColor: "#F3F4F6",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                  <Image
                    source={require("../../../assets/images/3davatar.png")}
                    style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#F3F4F6" }}
                  />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: "#181D18" }}>
                      {item.productName || `Item ${idx + 1}`}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                      {item.quantity} × ₹{item.unitPrice}
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#181D18" }}>
                  ₹{item.totalPrice != null ? item.totalPrice.toFixed(2) : "0.00"}
                </Text>
              </View>
            ))
          ) : (
            <Text style={{ fontSize: 13, color: "#9CA3AF", paddingVertical: 8 }}>
              No items found for this invoice.
            </Text>
          )}
        </View>

        {/* Supplier Card — your own business info on this invoice */}
        {invoice.supplierBusinessName && (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 16,
              marginTop: 16,
              borderWidth: 1,
              borderColor: "#F3F4F6",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={require("../../../assets/images/3davatar.png")}
                style={{ width: 44, height: 44, borderRadius: 22 }}
              />
              <View style={{ marginLeft: 12 }}>
                <Text style={{ fontSize: 15, fontWeight: "600", color: "#181D18" }}>
                  {invoice.supplierBusinessName}
                </Text>
                <View style={{ backgroundColor: "#F3F4F6", alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginTop: 4 }}>
                  <Text style={{ fontSize: 11, color: "#6B7280", fontWeight: "500" }}>Supplier</Text>
                </View>
              </View>
            </View>

            {invoice.supplierId && (
              <View style={{ marginTop: 16, borderTopWidth: 1, borderTopColor: "#E5E7EB", borderStyle: "dashed", paddingTop: 12 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 13, color: "#6B7280" }}>Supplier ID</Text>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: "#181D18" }}>{invoice.supplierId}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Retailer Card — the party this invoice was billed to.
            displayRetailerName is the real backend name when available,
            otherwise the same "Retailer Name N" substitute shown on the
            list screen (passed in via nav params), so the two screens
            never disagree. */}
        {invoice.retailerId && (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 16,
              marginTop: 16,
              borderWidth: 1,
              borderColor: "#F3F4F6",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={require("../../../assets/images/3davatar.png")}
                style={{ width: 44, height: 44, borderRadius: 22 }}
              />
              <View style={{ marginLeft: 12 }}>
                <Text style={{ fontSize: 15, fontWeight: "600", color: "#181D18" }}>
                  {displayRetailerName}
                </Text>
                <View style={{ backgroundColor: "#F3F4F6", alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginTop: 4 }}>
                  <Text style={{ fontSize: 11, color: "#6B7280", fontWeight: "500" }}>Billed to</Text>
                </View>
              </View>
            </View>

            <View style={{ marginTop: 16, borderTopWidth: 1, borderTopColor: "#E5E7EB", borderStyle: "dashed", paddingTop: 12 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 13, color: "#6B7280" }}>Retailer ID</Text>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#181D18" }}>{invoice.retailerId}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Totals */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            padding: 16,
            marginTop: 16,
            borderWidth: 1,
            borderColor: "#F3F4F6",
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
            <Text style={{ fontSize: 13, color: "#6B7280" }}>Subtotal</Text>
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#181D18" }}>₹{subtotal.toFixed(2)}</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
            <Text style={{ fontSize: 13, color: "#6B7280" }}>Delivery Charge</Text>
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#181D18" }}>₹{deliveryCharge.toFixed(2)}</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              borderTopWidth: 1,
              borderTopColor: "#E5E7EB",
              borderStyle: "dashed",
              paddingTop: 12,
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: "600", color: "#181D18" }}>Grand Total</Text>
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#2E7D32" }}>₹{grandTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Info note */}
        <View style={{ flexDirection: "row", alignItems: "flex-start", marginTop: 16, paddingHorizontal: 4 }}>
          <Feather name="info" size={14} color="#6B7280" style={{ marginRight: 6, marginTop: 2 }} />
          <Text style={{ fontSize: 12, color: "#6B7280", flex: 1 }}>
            You'll Be Able To Download And Share The Invoice Once The Order Has Been Delivered
          </Text>
        </View>

        {/* Action buttons */}
        <View style={{ flexDirection: "row", marginTop: 16 }}>
          <TouchableOpacity
            onPress={handleShare}
            activeOpacity={0.5}
            style={{
              flex: 1,
              flexDirection: "row",
              backgroundColor: "#2E7D32",
              borderColor: "#204724",
              borderWidth: 0.2,
              borderRadius: 8,
              paddingVertical: 12,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 8,
            }}
          >
            <Feather name="share-2" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 13 }}>Share Invoice</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDownload}
            activeOpacity={0.5}
            style={{
              flex: 1,
              flexDirection: "row",
              backgroundColor: "#2E7D32",
              borderColor: "#204724",
              borderWidth: 0.2,
              borderRadius: 8,
              paddingVertical: 12,
              alignItems: "center",
              justifyContent: "center",
              marginLeft: 8,
            }}
          >
            <Feather name="download" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 13 }}>Download PDF</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}