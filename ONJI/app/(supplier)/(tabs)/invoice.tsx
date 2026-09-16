import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";

import SegmentedControl from "@/components/credit/SegmentedControl";
import SearchFilterBar from "@/components/SearchFilterBar";
import InvoiceCard, { InvoiceItem } from "@/components/invoice/InvoiceCard";
import CreditSummaryCard from "@/components/credit/CreditSummaryCard";
import CreditInsightsBanner from "@/components/credit/CreditInsightsBanner";
import CreditCard, { CreditItem } from "@/components/credit/CreditCard";
import { useRouter } from "expo-router";

// ─────────────────────────────────────────────────────────────
// MOCK DATA — replace with your real API data
// ─────────────────────────────────────────────────────────────

const INVOICES: InvoiceItem[] = [
  {
    id: 1,
    supplier: "Harvest Ledger Sourcing",
    invoiceCount: 3,
    status: "Approved",
    date: "Oct 24, 2023",
    time: "09:45 AM",
    orderId: "#HL-99284",
    amount: "$1,240.00",
    expanded: true,
  },
  {
    id: 2,
    supplier: "Harvest Ledger Sourcing",
    invoiceCount: 3,
    status: "Approved",
    date: "Oct 24, 2023",
    time: "09:45 AM",
    orderId: "#HL-99284",
    amount: "$1,240.00",
  },
];

const ONGOING_CREDITS: CreditItem[] = [
  {
    id: "1",
    supplierName: "Harvest Ledger Sourcing",
    reliability: "HIGH",
    totalOwed: "$15200",
    lastPaidDate: "Oct 24, 2023",
    dueInDays: 3,
    repaymentProgress: 0.65,
    installmentsLabel: "6 installments in 12 months",
    creditsFulfilledLabel: "8/12 credits Fulfilled",
  },
  {
    id: "2",
    supplierName: "Harvest Ledger Sourcing",
    reliability: "MODERATE",
    totalOwed: "$15200",
    lastPaidDate: "Oct 24, 2023",
    dueInDays: 13,
    repaymentProgress: 0.65,
    installmentsLabel: "6 installments in 12 months",
    creditsFulfilledLabel: "8/12 credits Fulfilled",
  },
  {
    id: "3",
    supplierName: "Harvest Ledger Sourcing",
    reliability: "AT_RISK",
    overdue: true,
    totalOwed: "$15200",
    lastPaidDate: "Oct 24, 2023",
    dueInDays: 3,
    repaymentProgress: 0.65,
    installmentsLabel: "6 installments in 12 months",
    creditsFulfilledLabel: "8/12 credits Fulfilled",
  },
];

const NEW_REQUESTS: CreditItem[] = [
  {
    id: "4",
    supplierName: "Harvest Ledger Sourcing",
    address: "42 Market Street, Organic District, New Delhi 110001",
    reliability: "HIGH",
    totalOwed: "$15200",
    repaymentProgress: 0.65,
  },
  {
    id: "5",
    supplierName: "Harvest Ledger Sourcing",
    address: "42 Market Street, Organic District, New Delhi 110001",
    reliability: "FIRST_TIME",
    totalOwed: "$15200",
    repaymentProgress: 0,
  },
];

// ─────────────────────────────────────────────────────────────
// MAIN SCREEN — ONE tab, internal switch between Invoice and Credit
// ─────────────────────────────────────────────────────────────

export default function FinanceScreen() {
  const router = useRouter();

  // top-level switch: which "page" are we showing inside this single tab
  const [view, setView] = useState<"Invoice" | "Credit">("Invoice");

  // Invoice-only state
  const [invoiceStatusTab, setInvoiceStatusTab] = useState<"Approved" | "Delivered">("Approved");

  // Credit-only state
  const [creditSubTab, setCreditSubTab] = useState<"New Requests (5+)" | "Ongoing Credit">(
    "New Requests (5+)"
  );

  const [searchQuery, setSearchQuery] = useState("");

  const filteredInvoices = INVOICES.filter((inv) => inv.status === invoiceStatusTab);
  const creditList = creditSubTab === "Ongoing Credit" ? ONGOING_CREDITS : NEW_REQUESTS;
  const creditVariant = creditSubTab === "Ongoing Credit" ? "ongoing" : "request";

  const openCreditDetails = (item: CreditItem) => {
    router.push({
      pathname: "/(supplier)/CreditDetailsScreen",
      params: { creditId: item.id },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* HEADER — title changes with the active view */}
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
            <View style={{ marginBottom: 16 }}>
              <SegmentedControl
                options={["Approved", "Delivered"]}
                activeOption={invoiceStatusTab}
                onChange={(tab) => setInvoiceStatusTab(tab as typeof invoiceStatusTab)}
              />
            </View>

            <SearchFilterBar value={searchQuery} onChangeText={setSearchQuery} />

            {filteredInvoices.map((item) => (
              <InvoiceCard
                key={item.id}
                item={item}
                onViewDetails={(inv) => console.log("Open invoice details:", inv.id)}
              />
            ))}
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
      </ScrollView>
    </View>
  );
}