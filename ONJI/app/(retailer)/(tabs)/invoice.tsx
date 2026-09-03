import React, { useState, useEffect } from "react";
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
import { getRetailerInvoices, InvoiceItem } from "@/lib/api/invoice";
import { secureStorage } from "@/lib/secureStorage";
import { router } from "expo-router";

export default function Invoice() {
  const [activeTab, setActiveTab] = useState("Approved");
  const [searchQuery, setSearchQuery] = useState("");

 
  // 1. Dynamic state for API data
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

   const [retailerId, setRetailerId] = useState<string | null>(null);

  useEffect(() => {
    const loadRetailerId = async () => {
      const storedId = await secureStorage.getItem('userId');
      setRetailerId(storedId);
    };
    loadRetailerId();
  }, []);


  useEffect(() => {
    if (!retailerId) return; 
    const fetchInvoicesData = async () => {
      try {
        const data = await getRetailerInvoices(retailerId);
        if (data && data.length > 0) {
          setInvoices(data);
        }
      } catch (err) {
        console.warn("Could not retrieve invoices from backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoicesData();
  }, [retailerId]);
  const filteredInvoices = invoices.filter((item) => {
    const status = item.status?.toUpperCase();
    if (activeTab === "Approved") {
      return status === "APPROVED" || status === "PENDING" || status ==="GENERATED";
    }
    return status === "DELIVERED";
  });
 
  

  return (
    // MASTER CONTAINER: Sets the base background to white
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      
      
      <View style={{ 
        paddingHorizontal: 16, 
        paddingTop: 40, 
        paddingBottom: 10, 
        backgroundColor: "#FFFFFF" 
      }}>
        <Text style={{ fontSize: 22, fontWeight: "600", color: "#2A6B2D" }}>
          Invoice
        </Text>
      </View>

      
      <ScrollView 
        style={{ flex: 1, backgroundColor: "#F9FAFB" }} 
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        
        {/* Top Segmented Control */}
        <View style={{ flexDirection: 'row', backgroundColor: '#E2E2E2', padding: 4, borderRadius: 16, marginBottom: 16 }}>
          {["Approved", "Delivered"].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 16,
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
            borderRadius: 16, 
            paddingHorizontal: 16 
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
            backgroundColor: '#F1F5EC', // Light green background
            paddingHorizontal: 14, 
            borderRadius: 12, 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}>
            <Feather name="filter" size={20} color="#2E7D32" />
          </TouchableOpacity>
        </View>

        {/* Invoice List */}
        {filteredInvoices.map((item) => (
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
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Invoice #${item.id} from ${item.supplierBusinessName} for ₹${item.totalPrice}`,
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
              {item.supplierBusinessName || "Unknown Supplier"}
            </Text>
            <View style={{ backgroundColor: "#F3F4F6", alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginTop: 4 }}>
              <Text style={{ fontSize: 11, color: "#6B7280", fontWeight: "500" }}>
                {item.invoiceOrderItems?.length || 0} Invoices
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
          <View style={{ width: 6, height: 6, borderRadius: 7.33, backgroundColor: "#2A6B2D", marginRight: 6 }} />
          <Text style={{ fontSize: 12, color: "#6B7280", fontWeight: "500" }}>{item.status}</Text>
        </View>
        <Text style={{ fontSize: 11, color: "#6B7280" }}>
          {item.invoiceDate
  ? `${new Date(item.invoiceDate).toLocaleDateString()} • ${new Date(item.invoiceDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  : "N/A"}
        </Text>
      </View>

      {/* Order Info Row */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 12 }}>
        <View>
          <Text style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>Latest Order Id</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#181D18", marginRight: 6 }}>
              #{item.invoiceOrderItems?.[0]?.orderItemId || item.id}
            </Text>
            <Feather name="copy" size={14} color="#2E7D32" />
          </View>
        </View>
        <Text style={{ fontSize: 20, fontWeight: "700", color: "#2E7D32" }}>
          ₹{item.totalPrice != null ? item.totalPrice.toFixed(2) : "0.00"}
        </Text>
      </View>

      {/* Action Buttons Row */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16 }}>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity 
          style={{ padding: 10, backgroundColor: "#F7F9F5CC", borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: '#F3F4F6' }}>
            <Feather name="download" size={16} color="#0C5217" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={{ padding: 10, backgroundColor: "#F7F9F5CC", borderRadius: 8, borderWidth: 1, borderColor: '#F3F4F6' }}>
            <Feather name="share-2" size={16} color="#0C5217" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
        onPress={() => router.push("/invoiceDetails")}
          style={{ backgroundColor: "#2E7D32", paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8, justifyContent: "center" }}
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
              <Feather name="rotate-ccw" size={14} color="#0C5217CC" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 12, color: "#000000CC", fontWeight: "500" }}>
  +{Math.max((item.invoiceOrderItems?.length || 1) - 1, 0)} previous invoices
</Text>
            </View>
            <Text style={{ fontSize: 12, color: "#2E7D32", fontWeight: "600" }}>View all</Text>
          </View>

          {/* Wrap container for 2-column grid */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
            {item.invoiceOrderItems?.map((subItem: any, idx: number) => (
              <View 
                key={subItem.id || idx}
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
                  <Text style={{ fontSize: 8, color: "#6B7280" }}>
  {item.invoiceDate
    ? `${new Date(item.invoiceDate).toLocaleDateString()} • ${new Date(item.invoiceDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : "N/A"}
</Text>
<Text style={{ fontSize: 9, color: "#6B7280", marginTop: 4 }}>
  Order Id <Text style={{ fontWeight: "600", color: "#111827" }}>{subItem.orderItemId}</Text>
</Text>
<Text style={{ fontSize: 13, fontWeight: "700", color: "#111827", marginTop: 6 }}>
  ₹{subItem.totalPrice != null ? subItem.totalPrice.toFixed(2) : "0.00"}
</Text>
                </View>
                {/* Active selection styling for the first item */}
                <View 
  // @ts-ignore
  onMouseEnter={() => setHoveredIdx(idx)}
  // @ts-ignore
  onMouseLeave={() => setHoveredIdx(null)}
  style={{ 
                  width: 24, 
                  backgroundColor: hoveredIdx === idx ? "#4C8A5A" : "transparent", 
                  justifyContent: "center", 
                  alignItems: "center" 
                }}>
                  <Feather name="chevron-right" size={14} color={hoveredIdx === idx ? "#fff" : "#9CA3AF"} />
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}