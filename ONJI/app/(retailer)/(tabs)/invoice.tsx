/*
import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function Invoice() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
    
      <Feather name="shopping-cart" size={40} color="#D1D5DB" />

    
      <Text
        style={{
          marginTop: 16,
          fontSize: 18,
          fontWeight: "600",
          color: "#9CA3AF",
        }}
      >
        Looks like your cart's empty.
      </Text>

    
      <Text
        style={{
          marginTop: 6,
          fontSize: 13,
          color: "#D1D5DB",
          textAlign: "center",
        }}
      >
        Browse suppliers and add items you love.
      </Text>
    </View>
  );
}

*/
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Share } from "react-native";

export default function Invoice() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // Hard-coded data
  const invoices = [
    {
    id: 1,
    supplier: "Sunways trading",
    date: "12 Aug, 4:30 PM",
    status: "active",
  },
  {
    id: 2,
    supplier: "Green Valley Farms",
    date: "11 Aug, 3:20 PM",
    status: "active",
  },
  {
    id: 3,
    supplier: "Coastal Fresh Market",
    date: "10 Aug, 1:10 PM",
    status: "successful",
  },
  {
    id: 4,
    supplier: "Mountain Harvest",
    date: "9 Aug, 9:00 AM",
    status: "successful",
  },
  {
    id: 5,
    supplier: "Sunways trading",
    date: "8 Aug, 6:45 PM",
    status: "failed",
  },
];

  //  Filter logic
  const filteredInvoices = invoices.filter((item) => {
  const matchesSearch = item.supplier
    .toLowerCase()
    .includes(search.toLowerCase());

  const matchesFilter =
    filter === "all" || item.status === filter;

  return matchesSearch && matchesFilter;
});

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff", padding: 16 }}>

      
      <Text style={{ fontSize: 22, fontWeight: "700", color: "#2E7D32" }}>
        Invoices
      </Text>

     
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#F3F4F6",
          borderRadius: 10,
          paddingHorizontal: 12,
          marginTop: 12,
        }}
      >
        <Feather name="search" size={18} color="#9CA3AF" />
        <TextInput
          placeholder="Search"
          value={search}
          onChangeText={setSearch}
          style={{ marginLeft: 8, flex: 1 }}
        />
      </View>

     
      <View
        style={{
          flexDirection: "row",
          marginTop: 16,
          justifyContent: "space-between",
        }}
      >
        {["all", "active", "successful", "failed"].map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setFilter(item)}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 20,
              backgroundColor:
                filter === item ? "#E6F4EA" : "transparent",
              borderWidth: 1,
              borderColor:
                filter === item ? "#2E7D32" : "#E5E7EB",
            }}
          >
            <Text
              style={{
                color: filter === item ? "#2E7D32" : "#6B7280",
                fontWeight: "500",
              }}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

     
      {filter === "all" || filter === "active" ? (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: "600", marginBottom: 10 }}>
            Active Orders
          </Text>

          {filteredInvoices
            .filter((i) => i.status === "active")
            .map((item) => (
              <InvoiceCard key={item.id} item={item} type="active" />
            ))}
        </View>
      ) : null}

      {filter === "all" || filter === "successful" ? (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: "600", marginBottom: 10 }}>
            Successful Orders
          </Text>

          {filteredInvoices
            .filter((i) => i.status === "successful")
            .map((item) => (
              <InvoiceCard key={item.id} item={item} type="success" />
            ))}
        </View>
      ) : null}

    
      {filter === "all" || filter === "failed" ? (
  <View style={{ marginTop: 20 }}>
    <Text style={{ fontWeight: "600", marginBottom: 10 }}>
      Failed Orders
    </Text>

    {filteredInvoices
      .filter((i) => i.status === "failed")
      .map((item) => (
        <InvoiceCard key={item.id} item={item} type="failed" />
      ))}
  </View>
) : null}
    </ScrollView>
  );
}



// Invoice Card Component
function InvoiceCard({ item, type }: any) {
  const handleShare = async () => {
  try {
    await Share.share({
      message: `Invoice from ${item.supplier} (${item.date})`,
    });
  } catch (error) {
    console.log(error);
  }
};
  return (
    <View
      style={{
        backgroundColor: type === "failed" ? "#FDECEC" : "#fff",
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
      }}
    >
      <View
  style={{
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  }}
>
  <View style={{ flexDirection: "row", alignItems: "center" }}>
    <Image
      source={require("../../../assets/images/3davatar.png")}
      style={{ width: 40, height: 40, borderRadius: 20 }}
    />

    <View style={{ marginLeft: 10 }}>
      <Text style={{ fontWeight: "600" }}>{item.supplier}</Text>
      <Text style={{ color: "#6B7280", fontSize: 12 }}>
        {item.date}
      </Text>
    </View>
  </View>

  {/* Share Icon */}
  <TouchableOpacity onPress={handleShare}>
    <Feather name="share-2" size={18} color="#2E7D32" />
  </TouchableOpacity>
</View>

    
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 12,
        }}
      >
      <TouchableOpacity
        onPress={() => router.push("../invoiceSummary")}
        >
  <Text style={{ color: "#2E7D32", fontWeight: "600" }}>
    View Invoice
  </Text>
</TouchableOpacity>
  

        {type === "active" && (
          <TouchableOpacity>
            <Text style={{ color: "#6B7280" }}>
              Track Order
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
