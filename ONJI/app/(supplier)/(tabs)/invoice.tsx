import React, { useState, useEffect, useCallback } from "react";
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
import { router, useFocusEffect, useRouter } from "expo-router";
import { getSupplierInvoices, InvoiceItem } from "@/lib/api/invoice";
import { secureStorage } from "@/lib/secureStorage";
import CreditSummaryCard from "@/components/credit/CreditSummaryCard";
import CreditInsightsBanner from "@/components/credit/CreditInsightsBanner";
import SegmentedControl from "@/components/credit/SegmentedControl";
import SearchFilterBar from "@/components/SearchFilterBar";
import CreditCard, { CreditItem } from "@/components/credit/CreditCard"; // TODO: confirm this is the real path/export for CreditCard + CreditItem
import { formatINR, displayStatus, fmtDate, fmtTime, refId } from "@/lib/invoiceFormat";
const ONGOING_CREDITS: CreditItem[] = [];
const NEW_REQUESTS: CreditItem[] = [];

// Resolves the business name shown on a card.
// 1. Uses a real backend-provided name if one exists and isn't a known placeholder value.
// 2. Otherwise falls back to a substitute name that increments with the card's
//    position in the filtered list, so cards never collide even if their
//    underlying retailerId happens to be the same.
const APPROVED_STATUSES = ["APPROVED", "PENDING", "GENERATED"];

const getRetailerName = (item: any): string =>
  item?.retailerBusinessName ||
  item?.retailerName ||
  item?.retailer?.businessName ||
  item?.retailer?.name ||
  "Retailer";


type RetailerGroup = {
  key: string;
  retailerName: string;
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
// MAIN SCREEN — ONE tab, internal switch between Invoice and Credit
// ─────────────────────────────────────────────────────────────
export default function FinanceScreen() {
  const routerHook = useRouter();

  // top-level switch: which "page" are we showing inside this single tab
  const [view, setView] = useState<"Invoice" | "Credit">("Invoice");

  // ---- Invoice-only state (moved over from the old Invoice() screen) ----
  // const [invoiceStatusTab, setInvoiceStatusTab] = useState<"Approved" | "Delivered">("Approved");
  const [searchQuery, setSearchQuery] = useState("");
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [supplierId, setSupplierId] = useState<string | null>(null);

  // ---- Credit-only state ----
  const [creditSubTab, setCreditSubTab] = useState<"New Requests (5+)" | "Ongoing Credit">(
    "New Requests (5+)"
  );

useFocusEffect(
  useCallback(() => {
    let active = true;

    const loadInvoices = async () => {
      try {
        setLoading(true);

        const id = await secureStorage.getItem("userId");
        console.log("Finance screen supplierId:", id);

        if (!id) {
          console.warn("No userId found in secure storage");
          return; // finally still runs, so the spinner stops
        }

        setSupplierId(id);
        const data = await getSupplierInvoices(id);
        console.log("Invoices fetched:", data.length);

        if (active) setInvoices(data); // also handles the empty list
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

const groupMap = new Map<string, RetailerGroup>();

invoices
  .filter((i: any) => APPROVED_STATUSES.includes(i.status?.toUpperCase()))
  .forEach((i: any) => {
    const name = getRetailerName(i);
    const key = String(i.retailerId ?? name);
    if (!groupMap.has(key)) {
      groupMap.set(key, { key, retailerName: name, invoices: [], total: 0 });
    }
    const g = groupMap.get(key)!;
    g.invoices.push(i);
    g.total += Number(i.totalPrice ?? 0);
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
      g.retailerName.toLowerCase().includes(query) ||
      g.invoices.some((i) => String(i.id).toLowerCase().includes(query))
  )
  .sort(
    (a, b) =>
      new Date(b.invoices[0].invoiceDate).getTime() -
      new Date(a.invoices[0].invoiceDate).getTime()
  );

  const creditList = creditSubTab === "Ongoing Credit" ? ONGOING_CREDITS : NEW_REQUESTS;
  const creditVariant = creditSubTab === "Ongoing Credit" ? "ongoing" : "request";

  const openCreditDetails = (item: CreditItem) => {
    routerHook.push({
      pathname: "/(supplier)/CreditDetailsScreen",
      params: { creditId: item.id },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* HEADER */}
      <View style={{ paddingHorizontal: 16, paddingTop: 40, paddingBottom: 10 }}>
        <Text style={{ fontSize: 22, fontWeight: "700", color: "#2E7D32" }}>Finance</Text>
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: "#F9FAFB" }}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── The ONE switch that decides what renders below ── */}
        <View style={{ marginBottom: 16 }}>
          <SegmentedControl
            options={["Invoice", "Credit"]}
            activeOption={view}
            onChange={(option) => setView(option as "Invoice" | "Credit")}
          />
        </View>

        {view === "Invoice" ? (
          <>
            {/* <View style={{ marginBottom: 16 }}>
              <SegmentedControl
                options={["Approved", "Delivered"]}
                activeOption={invoiceStatusTab}
                onChange={(tab) => setInvoiceStatusTab(tab as typeof invoiceStatusTab)}
              />
            </View> */}

            {/* Search and Filter Row */}
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
                  placeholder="Search by retailer name..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
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

            {/* Loading and Empty States */}
 {/* Loading and Empty States */}
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
              Supplier Credit
            </Text>
            <Text style={{ fontSize: 12.5, color: "#6B7280", marginBottom: 16 }}>
              Manage & track outstanding balances for your wholesale partners.
            </Text>

            <CreditSummaryCard
              totalCreditAvailable="$18,500"
              utilizationRate="64.2%"
              activeAccounts={28}
              outstandingTotal="92,590"
              upcomingPayments={5}
              priorityLabel="Priority"
            />

            <CreditInsightsBanner />

            <View style={{ marginBottom: 16 }}>
              <SegmentedControl
                options={["New Requests (5+)", "Ongoing Credit"]}
                activeOption={creditSubTab}
                onChange={(tab) => setCreditSubTab(tab as typeof creditSubTab)}
              />
            </View>

            <SearchFilterBar value={searchQuery} onChangeText={setSearchQuery} />

            {creditList.map((item) => (
              <CreditCard
                key={item.id}
                item={item}
                variant={creditVariant}
                onNudge={openCreditDetails}
                onDetails={openCreditDetails}
                onCall={(i) => console.log("Call supplier:", i.supplierName)}
                onAccept={(i) => console.log("Accept request:", i.id)}
                onDecline={(i) => console.log("Decline request:", i.id)}
                onViewExisting={openCreditDetails}
              />
            ))}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Invoice Card Component
// ─────────────────────────────────────────────────────────────
function InvoiceCard({ group }: { group: RetailerGroup }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const latest = group.invoices[0];
  const previous = group.invoices.slice(1);
  const previewList = previous.slice(0, 4); // max 4 shown, the rest live on "View all"

  const openDetails = (inv: any) =>
    router.push({
      pathname: "/invoiceDetails",
      params: { invoiceId: inv.id, retailerName: group.retailerName },
    });

  const openAll = () =>
    router.push({
      pathname: "/retailerInvoices",
      params: { retailerKey: group.key, retailerName: group.retailerName },
    });

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Invoice ${refId(latest)} from ${group.retailerName} for ${formatINR(Number(latest.totalPrice ?? 0))}`,
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
            {group.retailerName}
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
        <Text style={{ fontSize: 20, fontWeight: "700", color: "#2E7D32" }}>
          {formatINR(Number(latest.totalPrice ?? 0))}
        </Text>
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
                      {formatINR(Number(inv.totalPrice ?? 0))}
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