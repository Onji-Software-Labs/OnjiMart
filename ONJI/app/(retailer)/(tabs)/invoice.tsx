import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
} from "react-native";
import { Feather } from "@expo/vector-icons";

export default function Invoice() {
  const [activeTab, setActiveTab] = useState("Approved");
  const [searchQuery, setSearchQuery] = useState("");

  // Hard-coded data
  const invoices = [
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
      expanded: false,
    },
    {
      id: 3,
      supplier: "Harvest Ledger Sourcing",
      invoiceCount: 3,
      status: "Approved",
      date: "Oct 24, 2023",
      time: "09:45 AM",
      orderId: "#HL-99284",
      amount: "$1,240.00",
      expanded: false,
    },
    {
      id: 4,
      supplier: "Harvest Ledger Sourcing",
      invoiceCount: 3,
      status: "Approved",
      date: "Oct 24, 2023",
      time: "09:45 AM",
      orderId: "#HL-99284",
      amount: "$1,240.00",
      expanded: false,
    },
  ];

  return (
    // MASTER CONTAINER: Sets the base background to white
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      
      
      <View style={{ 
        paddingHorizontal: 16, 
        paddingTop: 40, 
        paddingBottom: 10, 
        backgroundColor: "#FFFFFF" 
      }}>
        <Text style={{ fontSize: 22, fontWeight: "700", color: "#2E7D32" }}>
          Invoice
        </Text>
      </View>

      
      <ScrollView 
        style={{ flex: 1, backgroundColor: "#F9FAFB" }} 
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        
        {/* Top Segmented Control */}
        <View style={{ flexDirection: 'row', backgroundColor: '#E5E7EB', padding: 4, borderRadius: 12, marginBottom: 16 }}>
          {["Approved", "Delivered"].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: 'center',
                backgroundColor: activeTab === tab ? '#FFFFFF' : 'transparent',
                // Add shadow only to the active tab
                ...(activeTab === tab ? {
                  shadowColor: '#000',
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 2,
                } : {})
              }}
            >
              <Text style={{ 
                color: activeTab === tab ? '#2E7D32' : '#6B7280', 
                fontWeight: activeTab === tab ? '600' : '500' 
              }}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search and Filter Row */}
        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
          <View style={{ 
            flex: 1, 
            flexDirection: 'row', 
            alignItems: 'center', 
            backgroundColor: '#FFFFFF', 
            borderWidth: 1, 
            borderColor: '#E5E7EB', 
            borderRadius: 12, 
            paddingHorizontal: 12 
          }}>
            <TextInput
              placeholder='Search "Random kaka"'
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ flex: 1, paddingVertical: 12, color: '#111827', fontSize: 14 }}
              placeholderTextColor="#9CA3AF"
            />
            <Feather name="search" size={18} color="#9CA3AF" />
          </View>

          <TouchableOpacity style={{ 
            marginLeft: 12, 
            backgroundColor: '#F0F5F1', // Light green background
            paddingHorizontal: 14, 
            borderRadius: 12, 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}>
            <Feather name="filter" size={20} color="#2E7D32" />
          </TouchableOpacity>
        </View>

        {/* Invoice List */}
        {invoices.map((item) => (
          <InvoiceCard key={item.id} item={item} />
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// Invoice Card Component
function InvoiceCard({ item }: any) {
  // 1. Add local state to manage expand/collapse
  const [isExpanded, setIsExpanded] = useState(item.expanded || false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Invoice from ${item.supplier} for ${item.amount}`,
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
      {/* Header Row */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={require("../../../assets/images/3davatar.png")}
            style={{ width: 44, height: 44, borderRadius: 22 }}
          />
          <View style={{ marginLeft: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}>
              {item.supplier}
            </Text>
            <View style={{ backgroundColor: "#F3F4F6", alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginTop: 4 }}>
              <Text style={{ fontSize: 11, color: "#6B7280", fontWeight: "500" }}>
                {item.invoiceCount} Invoices
              </Text>
            </View>
          </View>
        </View>

        {/* 2. Wrap the chevron in a TouchableOpacity to make it clickable */}
        <TouchableOpacity 
          onPress={() => setIsExpanded(!isExpanded)} 
          style={{ padding: 4 }} // Small padding makes it easier to tap
        >
          <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Status & Date Row */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#2E7D32", marginRight: 6 }} />
          <Text style={{ fontSize: 12, color: "#6B7280", fontWeight: "500" }}>{item.status}</Text>
        </View>
        <Text style={{ fontSize: 11, color: "#6B7280" }}>
          {item.date} • {item.time}
        </Text>
      </View>

      {/* Order Info Row */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 12 }}>
        <View>
          <Text style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>Latest Order Id</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#111827", marginRight: 6 }}>
              {item.orderId}
            </Text>
            <Feather name="copy" size={14} color="#2E7D32" />
          </View>
        </View>
        <Text style={{ fontSize: 20, fontWeight: "700", color: "#2E7D32" }}>
          {item.amount}
        </Text>
      </View>

      {/* Action Buttons Row */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16 }}>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity style={{ padding: 10, backgroundColor: "#F9FAFB", borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: '#F3F4F6' }}>
            <Feather name="download" size={16} color="#4B5563" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={{ padding: 10, backgroundColor: "#F9FAFB", borderRadius: 8, borderWidth: 1, borderColor: '#F3F4F6' }}>
            <Feather name="share-2" size={16} color="#4B5563" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={{ backgroundColor: "#4C8A5A", paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8, justifyContent: "center" }}
        >
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>
            Invoice Details
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3. Use 'isExpanded' state to show/hide this section */}
      {isExpanded && (
        <View style={{ marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#E5E7EB", borderStyle: "dashed" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Feather name="rotate-ccw" size={14} color="#2E7D32" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 12, color: "#4B5563", fontWeight: "500" }}>+2 previous invoices</Text>
            </View>
            <Text style={{ fontSize: 12, color: "#2E7D32", fontWeight: "600" }}>View all</Text>
          </View>

          {/* Wrap container for 2-column grid */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
            {[1, 2, 3, 4].map((subItem, idx) => (
              <View 
                key={idx} 
                style={{ 
                  flexDirection: "row", 
                  width: "48%", // Forces 2 columns
                  backgroundColor: "#F9FAFB", 
                  borderRadius: 12, 
                  marginBottom: 12, 
                  borderWidth: 1, 
                  borderColor: "#F3F4F6", 
                  overflow: "hidden" 
                }}
              >
                <View style={{ padding: 10, flex: 1 }}>
                  <Text style={{ fontSize: 8, color: "#6B7280" }}>{item.date} • {item.time}</Text>
                  <Text style={{ fontSize: 9, color: "#6B7280", marginTop: 4 }}>
                    Order Id <Text style={{ fontWeight: "600", color: "#111827" }}>{item.orderId}</Text>
                  </Text>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827", marginTop: 6 }}>
                    {item.amount}
                  </Text>
                </View>
                {/* Active selection styling for the first item */}
                <View style={{ 
                  width: 24, 
                  backgroundColor: idx === 0 ? "#4C8A5A" : "transparent", 
                  justifyContent: "center", 
                  alignItems: "center" 
                }}>
                  <Feather name="chevron-right" size={14} color={idx === 0 ? "#fff" : "#9CA3AF"} />
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}