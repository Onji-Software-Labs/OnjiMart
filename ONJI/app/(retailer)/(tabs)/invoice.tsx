import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Image,
  Share,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { getRetailerInvoices, InvoiceItem } from "@/lib/api/invoice";
import { secureStorage } from "@/lib/secureStorage";
import SegmentedControl from "@/components/credit/SegmentedControl";
import { formatINR, displayStatus, fmtDate, fmtTime, refId } from "@/lib/invoiceFormat";

const APPROVED_STATUSES = ["APPROVED", "PENDING", "GENERATED"];

// Backend currently returns totalPrice = 0 on generated invoices.
// Fallback: subtotal + GST + delivery charge.
const invoiceTotal = (i: any): number => {
  const t = Number(i?.totalPrice ?? 0);
  if (t > 0) return t;
  return Number(i?.subtotal ?? 0) + Number(i?.gstAmount ?? 0) + Number(i?.deliveryCharge ?? 0);
};

// Resolves the supplier name shown on a card.
const getSupplierName = (item: any): string =>
  item?.supplierBusinessName ||
  item?.supplierName ||
  item?.supplier?.businessName ||
  item?.supplier?.name ||
  "Unknown Supplier";

type SupplierGroup = {
  key: string;
  supplierName: string;
  invoices: any[]; // newest first
  total: number;
};

const chip = {
  backgroundColor: "#F3F4F6",
  paddingHorizontal: 8,
  paddingVertical: 2,
  borderRadius: 10,
  alignSelf: "flex-start",
} as const;

// ─────────────────────────────────────────────────────────────
// CREDIT (retailer side)
// A retailer RECEIVES credit from suppliers: they see how much they can
// still use, what they owe, and when to pay. They don't accept/decline.
// ─────────────────────────────────────────────────────────────
type RetailerCredit = {
  id: string;
  supplierId?: string;
  supplierName: string;
  creditLimit: number; // total line granted by the supplier
  used: number; // amount currently owed
  dueDate?: string; // ISO date of the next repayment
  status: "ACTIVE" | "OVERDUE" | "OFFER" | "REQUESTED";
};

// TODO: replace with the real API call (e.g. getRetailerCredits(userId)).
// Kept empty like the supplier screen; set USE_CREDIT_MOCK to true to preview the UI.
const USE_CREDIT_MOCK = false;
const MOCK_CREDITS: RetailerCredit[] = [
  { id: "c1", supplierName: "Fresh Farms Pvt Ltd", creditLimit: 50000, used: 32000, dueDate: "2026-10-12", status: "ACTIVE" },
  { id: "c2", supplierName: "Sharma Wholesale", creditLimit: 30000, used: 21500, dueDate: "2026-09-25", status: "OVERDUE" },
  { id: "c3", supplierName: "Green Valley Traders", creditLimit: 40000, used: 0, status: "OFFER" },
  { id: "c4", supplierName: "Metro Grains", creditLimit: 25000, used: 0, status: "REQUESTED" },
];

const daysUntil = (iso?: string): number | null => {
  if (!iso) return null;
  const d = new Date(iso).getTime();
  if (isNaN(d)) return null;
  return Math.ceil((d - Date.now()) / 86400000);
};

const dueLabel = (iso?: string): { text: string; color: string } => {
  const n = daysUntil(iso);
  if (n === null) return { text: "No due date", color: "#6B7280" };
  if (n < 0) return { text: `Overdue by ${Math.abs(n)} day${Math.abs(n) > 1 ? "s" : ""}`, color: "#C62828" };
  if (n === 0) return { text: "Due today", color: "#E65100" };
  if (n <= 5) return { text: `Due in ${n} day${n > 1 ? "s" : ""}`, color: "#E65100" };
  return { text: `Due ${fmtDate(iso as string)}`, color: "#2A6B2D" };
};

// ── Summary: "what can I still buy on credit, and what do I owe?" ──
function RetailerCreditSummary({ credits }: { credits: RetailerCredit[] }) {
  const active = credits.filter((c) => c.status === "ACTIVE" || c.status === "OVERDUE");
  const totalLimit = active.reduce((s, c) => s + c.creditLimit, 0);
  const outstanding = active.reduce((s, c) => s + c.used, 0);
  const available = Math.max(totalLimit - outstanding, 0);
  const usedPct = totalLimit > 0 ? Math.min((outstanding / totalLimit) * 100, 100) : 0;
  const overdueCount = active.filter((c) => c.status === "OVERDUE").length;

  const nextDue = active
    .filter((c) => c.used > 0 && c.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())[0];

  return (
    <View
      style={{
        backgroundColor: "#2E7D32",
        borderRadius: 20,
        padding: 18,
        marginBottom: 16,
      }}
    >
      <Text style={{ fontSize: 12, color: "#C8E6C9" }}>Available to spend</Text>
      <Text style={{ fontSize: 30, fontWeight: "700", color: "#FFFFFF", marginTop: 2 }}>
        {formatINR(available)}
      </Text>

      {/* Usage bar */}
      <View style={{ height: 6, borderRadius: 3, backgroundColor: "#FFFFFF33", marginTop: 14 }}>
        <View style={{ width: `${usedPct}%`, height: 6, borderRadius: 3, backgroundColor: "#FFFFFF" }} />
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
        <Text style={{ fontSize: 11, color: "#C8E6C9" }}>Used {formatINR(outstanding)}</Text>
        <Text style={{ fontSize: 11, color: "#C8E6C9" }}>Limit {formatINR(totalLimit)}</Text>
      </View>

      {/* Bottom stats */}
      <View
        style={{
          flexDirection: "row",
          marginTop: 16,
          paddingTop: 14,
          borderTopWidth: 1,
          borderTopColor: "#FFFFFF33",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, color: "#C8E6C9" }}>You owe</Text>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#FFFFFF", marginTop: 2 }}>
            {formatINR(outstanding)}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, color: "#C8E6C9" }}>Next payment</Text>
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#FFFFFF", marginTop: 2 }}>
            {nextDue ? fmtDate(nextDue.dueDate as string) : "—"}
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <Text style={{ fontSize: 10, color: "#C8E6C9" }}>Suppliers</Text>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#FFFFFF", marginTop: 2 }}>
            {active.length}
          </Text>
        </View>
      </View>

      {overdueCount > 0 && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#FFEBEE",
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 8,
            marginTop: 14,
          }}
        >
          <Feather name="alert-circle" size={14} color="#C62828" />
          <Text style={{ fontSize: 12, color: "#C62828", marginLeft: 6, flex: 1 }}>
            {overdueCount} overdue payment{overdueCount > 1 ? "s" : ""} — clear them to keep buying on credit.
          </Text>
        </View>
      )}
    </View>
  );
}

// ── One credit line with one supplier ──
function RetailerCreditCard({ item }: { item: RetailerCredit }) {
  const isOffer = item.status === "OFFER";
  const isRequested = item.status === "REQUESTED";
  const isOverdue = item.status === "OVERDUE";

  const available = Math.max(item.creditLimit - item.used, 0);
  const usedPct = item.creditLimit > 0 ? Math.min((item.used / item.creditLimit) * 100, 100) : 0;
  const due = dueLabel(item.dueDate);

  const openDetails = () =>
    router.push({
      pathname: "/creditDetails", // TODO: confirm retailer credit details route
      params: { creditId: item.id, supplierName: item.supplierName },
    });

  const payNow = () =>
    router.push({
      pathname: "/payCredit", // TODO: repayment screen
      params: { creditId: item.id, supplierName: item.supplierName },
    });

  const requestCredit = () => {
    // TODO: call the "request credit" endpoint
    console.log("Request credit from:", item.supplierName);
  };

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: isOverdue ? "#FFCDD2" : "#F3F4F6",
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image
          source={require("../../../assets/images/3davatar.png")}
          style={{ width: 44, height: 44, borderRadius: 22 }}
        />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text numberOfLines={2} style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}>
            {item.supplierName}
          </Text>
          <View
            style={[
              chip,
              {
                marginTop: 4,
                backgroundColor: isOverdue ? "#FFEBEE" : isOffer ? "#E8F5E9" : "#F3F4F6",
              },
            ]}
          >
            <Text
              style={{
                fontSize: 10,
                lineHeight: 14,
                color: isOverdue ? "#C62828" : isOffer ? "#2E7D32" : "#6B7280",
                fontWeight: "500",
              }}
            >
              {isOverdue ? "Overdue" : isOffer ? "Credit offer" : isRequested ? "Request sent" : "Active"}
            </Text>
          </View>
        </View>
      </View>

      {/* Amounts */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16 }}>
        <View>
          <Text style={{ fontSize: 10, color: "#6B7280" }}>{isOffer || isRequested ? "Credit limit" : "Available"}</Text>
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#2E7D32", marginTop: 2 }}>
            {formatINR(isOffer || isRequested ? item.creditLimit : available)}
          </Text>
        </View>
        {!isOffer && !isRequested && (
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 10, color: "#6B7280" }}>You owe</Text>
            <Text style={{ fontSize: 20, fontWeight: "700", color: isOverdue ? "#C62828" : "#111827", marginTop: 2 }}>
              {formatINR(item.used)}
            </Text>
          </View>
        )}
      </View>

      {/* Usage bar (active lines only) */}
      {!isOffer && !isRequested && (
        <>
          <View style={{ height: 6, borderRadius: 3, backgroundColor: "#E5E7EB", marginTop: 12 }}>
            <View
              style={{
                width: `${usedPct}%`,
                height: 6,
                borderRadius: 3,
                backgroundColor: isOverdue ? "#C62828" : "#2E7D32",
              }}
            />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <Text style={{ fontSize: 11, color: "#6B7280" }}>Limit {formatINR(item.creditLimit)}</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Feather name="calendar" size={11} color={due.color} />
              <Text style={{ fontSize: 11, color: due.color, fontWeight: "500", marginLeft: 4 }}>{due.text}</Text>
            </View>
          </View>
        </>
      )}

      {/* Actions */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <TouchableOpacity
          onPress={openDetails}
          style={{
            paddingHorizontal: 18,
            paddingVertical: 10,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#2E7D32",
          }}
        >
          <Text style={{ color: "#2E7D32", fontWeight: "600", fontSize: 13 }}>Details</Text>
        </TouchableOpacity>

        {isOffer ? (
          <TouchableOpacity
            onPress={requestCredit}
            style={{ backgroundColor: "#2E7D32", paddingHorizontal: 28, paddingVertical: 10, borderRadius: 8 }}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>Request Credit</Text>
          </TouchableOpacity>
        ) : isRequested ? (
          <View style={{ backgroundColor: "#F3F4F6", paddingHorizontal: 28, paddingVertical: 10, borderRadius: 8 }}>
            <Text style={{ color: "#6B7280", fontWeight: "600", fontSize: 13 }}>Awaiting approval</Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={payNow}
            disabled={item.used <= 0}
            style={{
              backgroundColor: item.used <= 0 ? "#A5D6A7" : isOverdue ? "#C62828" : "#2E7D32",
              paddingHorizontal: 28,
              paddingVertical: 10,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>Pay Now</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// Defined OUTSIDE the screen so the TextInput keeps focus while typing.
const SearchRow = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (t: string) => void;
  placeholder: string;
}) => (
  <View style={{ flexDirection: "row", marginBottom: 20 }}>
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 16,
        paddingHorizontal: 16,
      }}
    >
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChange}
        style={{ flex: 1, paddingVertical: 12, color: "#111827", fontSize: 14 }}
        placeholderTextColor="#9CA3AF"
      />
      <Feather name="search" size={18} color="#9CA3AF" />
    </View>

    <TouchableOpacity
      style={{
        marginLeft: 12,
        backgroundColor: "#F1F5EC",
        paddingHorizontal: 14,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Feather name="filter" size={20} color="#2E7D32" />
    </TouchableOpacity>
  </View>
);

// ─────────────────────────────────────────────────────────────
// MAIN SCREEN — ONE screen, internal switch between Invoice and Credit
// ─────────────────────────────────────────────────────────────
export default function Invoice() {
  const [view, setView] = useState<"Invoice" | "Credit">("Invoice");

  // Invoice state
  const [searchQuery, setSearchQuery] = useState("");
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Credit state (own search so the two tabs don't share text)
  const [creditSubTab, setCreditSubTab] = useState<"My Credit" | "Available Offers">("My Credit");
  const [creditQuery, setCreditQuery] = useState("");
  const [credits, setCredits] = useState<RetailerCredit[]>(USE_CREDIT_MOCK ? MOCK_CREDITS : []);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadInvoices = async () => {
        try {
          setLoading(true);

          const id = await secureStorage.getItem("userId");
          if (!id) {
            console.warn("No userId found in secure storage");
            return; // finally still runs, so the spinner stops
          }

          const data = await getRetailerInvoices(id);
          if (active) setInvoices(data ?? []); // also handles the empty list

          // TODO: load the retailer's credit lines here too
          // const creditData = await getRetailerCredits(id);
          // if (active) setCredits(creditData ?? []);
        } catch (err) {
          console.warn("Could not retrieve invoices from backend.", err);
        } finally {
          if (active) setLoading(false);
        }
      };

      loadInvoices();

      return () => {
        active = false; // avoids state updates after leaving the screen
      };
    }, [])
  );

  // ── Invoices: filter by status, then group by supplier ──
  const groupMap = new Map<string, SupplierGroup>();

  invoices
    .filter((i: any) => APPROVED_STATUSES.includes(i.status?.toUpperCase()))
    .forEach((i: any) => {
      const name = getSupplierName(i);
      const key = String(i.supplierId ?? name);
      if (!groupMap.has(key)) {
        groupMap.set(key, { key, supplierName: name, invoices: [], total: 0 });
      }
      const g = groupMap.get(key)!;
      g.invoices.push(i);
      g.total += invoiceTotal(i);
    });

  const query = searchQuery.toLowerCase().trim();

  const groups = Array.from(groupMap.values())
    .map((g) => ({
      ...g,
      invoices: g.invoices.sort(
        (a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()
      ),
    }))
    .filter(
      (g) =>
        query === "" ||
        g.supplierName.toLowerCase().includes(query) ||
        g.invoices.some((i) => String(i.id).toLowerCase().includes(query))
    )
    .sort(
      (a, b) =>
        new Date(b.invoices[0].invoiceDate).getTime() -
        new Date(a.invoices[0].invoiceDate).getTime()
    );

  // ── Credit: tab + search ──
  const creditQ = creditQuery.toLowerCase().trim();
  const visibleCredits = useMemo(() => {
    const wanted =
      creditSubTab === "My Credit" ? ["ACTIVE", "OVERDUE"] : ["OFFER", "REQUESTED"];
    return credits
      .filter((c) => wanted.includes(c.status))
      .filter((c) => creditQ === "" || c.supplierName.toLowerCase().includes(creditQ))
      .sort((a, b) => {
        // overdue first, then nearest due date
        if (a.status === "OVERDUE" && b.status !== "OVERDUE") return -1;
        if (b.status === "OVERDUE" && a.status !== "OVERDUE") return 1;
        return (
          new Date(a.dueDate ?? "2999-01-01").getTime() -
          new Date(b.dueDate ?? "2999-01-01").getTime()
        );
      });
  }, [credits, creditSubTab, creditQ]);


  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* HEADER */}
      <View style={{ paddingHorizontal: 16, paddingTop: 40, paddingBottom: 10, backgroundColor: "#FFFFFF" }}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={10}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <Feather name="arrow-left" size={22} color="#2E7D32" />
          <Text style={{ fontSize: 22, fontWeight: "700", color: "#2E7D32", marginLeft: 8 }}>
            {view === "Invoice" ? "Invoice" : "Credit"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: "#F9FAFB" }}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Invoice / Credit switch */}
        <View style={{ marginBottom: 16 }}>
          <SegmentedControl
            options={["Invoice", "Credit"]}
            activeOption={view}
            onChange={(option) => setView(option as "Invoice" | "Credit")}
          />
        </View>

        {view === "Invoice" ? (
          <>
            <SearchRow
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by supplier name..."
            />

            {loading ? (
              <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 40 }} />
            ) : groups.length === 0 ? (
              <View style={{ alignItems: "center", marginTop: 40 }}>
                <Text style={{ color: "#6B7280", fontSize: 14 }}>No invoices found.</Text>
              </View>
            ) : (
              groups.map((g) => <InvoiceCard key={g.key} group={g} />)
            )}
          </>
        ) : (
          <>
            <Text style={{ fontSize: 17, fontWeight: "700", color: "#111827", marginBottom: 2 }}>
              Your Credit
            </Text>
            <Text style={{ fontSize: 12.5, color: "#6B7280", marginBottom: 16 }}>
              Buy now, pay later. Track what you owe and when each payment is due.
            </Text>

            <RetailerCreditSummary credits={credits} />

            <View style={{ marginBottom: 16 }}>
              <SegmentedControl
                options={["My Credit", "Available Offers"]}
                activeOption={creditSubTab}
                onChange={(tab) => setCreditSubTab(tab as typeof creditSubTab)}
              />
            </View>

            <SearchRow
              value={creditQuery}
              onChange={setCreditQuery}
              placeholder="Search by supplier name..."
            />

            {visibleCredits.length === 0 ? (
              <View style={{ alignItems: "center", marginTop: 40 }}>
                <Feather name="credit-card" size={28} color="#9CA3AF" />
                <Text style={{ color: "#6B7280", fontSize: 14, marginTop: 10, textAlign: "center" }}>
                  {creditSubTab === "My Credit"
                    ? "You have no active credit yet."
                    : "No credit offers from suppliers right now."}
                </Text>
              </View>
            ) : (
              visibleCredits.map((c) => <RetailerCreditCard key={c.id} item={c} />)
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Invoice Card Component (one card per supplier)
// ─────────────────────────────────────────────────────────────
function InvoiceCard({ group }: { group: SupplierGroup }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const latest = group.invoices[0];
  const previous = group.invoices.slice(1);
  const previewList = previous.slice(0, 4); // max 4 shown, the rest live on "View all"

  const openDetails = (inv: any) =>
    router.push({
      pathname: "/invoiceDetails",
      params: { invoiceId: inv.id, supplierName: group.supplierName },
    });

  const openAll = () =>
    router.push({
      pathname: "/supplierInvoices", // new screen: all invoices of this supplier
      params: { supplierKey: group.key, supplierName: group.supplierName },
    });

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Invoice ${refId(latest)} from ${group.supplierName} for ${formatINR(invoiceTotal(latest))}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#F3F4F6",
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image
          source={require("../../../assets/images/3davatar.png")}
          style={{ width: 44, height: 44, borderRadius: 22 }}
        />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text numberOfLines={2} style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}>
            {group.supplierName}
          </Text>
          <View style={[chip, { marginTop: 4 }]}>
            <Text style={{ fontSize: 10, lineHeight: 14, color: "#6B7280" }}>
              {group.invoices.length} Invoice{group.invoices.length > 1 ? "s" : ""}
            </Text>
          </View>
        </View>
        {previous.length > 0 && (
          <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} hitSlop={10}>
            <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Status + date */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#2A6B2D", marginRight: 6 }} />
          <Text style={{ fontSize: 12, color: "#2A6B2D", fontWeight: "500" }}>
            {displayStatus(latest.status)}
          </Text>
        </View>
        <Text style={{ fontSize: 11, color: "#6B7280" }}>
          {fmtDate(latest.invoiceDate)}  •  {fmtTime(latest.invoiceDate)}
        </Text>
      </View>

      {/* Latest order id + amount */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontSize: 10, color: "#6B7280", marginRight: 6 }}>Latest Order Id</Text>
          <Text style={{ fontSize: 12, fontWeight: "600", color: "#181D18", marginRight: 5 }}>
            {refId(latest)}
          </Text>
          <Feather name="copy" size={12} color="#2E7D32" />
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 10, color: "#6B7280" }}>Grand Total</Text>
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#2E7D32" }}>
            {formatINR(invoiceTotal(latest))}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            style={{ padding: 8, backgroundColor: "#F7F9F5CC", borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: "#F3F4F6" }}
          >
            <Feather name="download" size={13} color="#0C5217" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShare}
            style={{ padding: 8, backgroundColor: "#F7F9F5CC", borderRadius: 8, borderWidth: 1, borderColor: "#F3F4F6" }}
          >
            <Feather name="share-2" size={13} color="#0C5217" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => openDetails(latest)}
          style={{ backgroundColor: "#2E7D32", paddingHorizontal: 28, paddingVertical: 10, borderRadius: 8 }}
        >
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>Invoice Details</Text>
        </TouchableOpacity>
      </View>

      {/* Previous invoices */}
      {previous.length > 0 && (
        <View style={{ marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: "#E5E7EB", borderStyle: "dashed" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Feather name="rotate-ccw" size={13} color="#0C5217CC" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 12, color: "#000000CC", fontWeight: "500" }}>
                +{previous.length} previous invoice{previous.length > 1 ? "s" : ""}
              </Text>
            </View>
            <TouchableOpacity onPress={openAll} hitSlop={8}>
              <Text style={{ fontSize: 12, color: "#2E7D32", fontWeight: "600" }}>View all</Text>
            </TouchableOpacity>
          </View>

          {isExpanded && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 12 }}>
              {previewList.map((inv: any) => (
                <Pressable
                  key={inv.id}
                  onPress={() => openDetails(inv)}
                  style={({ pressed }) => ({
                    width: "48%",
                    backgroundColor: pressed ? "#E8F5E9" : "#F9FAFB",
                    borderRadius: 12,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: "#F3F4F6",
                    padding: 10,
                    flexDirection: "row",
                    alignItems: "center",
                  })}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 8, color: "#6B7280" }}>
                      {fmtDate(inv.invoiceDate)}  •  {fmtTime(inv.invoiceDate)}
                    </Text>
                    <Text style={{ fontSize: 9, color: "#6B7280", marginTop: 6 }}>
                      Order Id{"  "}
                      <Text style={{ fontWeight: "600", color: "#111827" }}>{refId(inv)}</Text>
                    </Text>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827", marginTop: 6 }}>
                      {formatINR(invoiceTotal(inv))}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={12} color="#9CA3AF" />
                </Pressable>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}