import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { TextInput } from "react-native";
import { submitOrder } from "@/lib/api/order"; 

export default function CheckoutScreen() {
  const router = useRouter();
  const { cart } = useLocalSearchParams();

  
  const parsedCart = cart ? JSON.parse(cart as string) : null;

  const [selectedDay, setSelectedDay] = useState("Thu");
  const [selectedTime, setSelectedTime] = useState("Morning");

  const days = [
  { day: "Sun", date: "Mar 24", available: true },
  { day: "Mon", date: "Mar 25", available: true },
  { day: "Tue", date: "Mar 26", available: true },
  { day: "Wed", date: "Mar 25", available: false },
  { day: "Thu", date: "Mar 27", available: true },
  { day: "Fri", date: "Mar 28", available: true },
  { day: "Sat", date: "Mar 29", available: false },
];

const [loading, setLoading] = useState(false);

const [quantities, setQuantities] = useState<{ [key: string]: string }>({});

const timeSlots = [
  { label: "Morning", time: "7 am – 12 pm", available: true },
  { label: "Afternoon", time: "12 pm – 3 pm", available: false },
  { label: "Evening", time: "3 pm – 6 pm", available: true },
];
  if (!parsedCart) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* HEADER */}
      <View style={{ flexDirection: "row", alignItems: "center", padding: 16 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#16A34A" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: "700", marginLeft: 10, color: "#16A34A" }}>
          Checkout
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        
        {/* SUPPLIER */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#ddd",
              marginRight: 10,
            }}
          />
          <View>
            <Text style={{ fontWeight: "700" }}>
              {parsedCart.supplierName}
            </Text>
            <Text style={{ fontSize: 12, color: "#666" }}>Aslam</Text>
          </View>
        </View>

        {/* SCHEDULE DELIVERY */}
        <Text style={{ fontWeight: "600", marginBottom: 10 }}>
          Schedule delivery
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
  {days.map((item) => (
    <TouchableOpacity
      key={item.day}
      disabled={!item.available}
      onPress={() => setSelectedDay(item.day)}
      style={{
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 14,
        marginRight: 10,
        borderRadius: 14,
        borderWidth: 1,
        borderColor:
          selectedDay === item.day ? "#2E7D32" : "#E5E7EB",
        backgroundColor:
          selectedDay === item.day ? "#F3F4F6" : "#F3F4F6",
        opacity: item.available ? 1 : 0.5,
        minWidth: 70,
      }}
    >
      {/* DOT */}
      {selectedDay === item.day && (
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: "#2E7D32",
            marginBottom: 4,
          }}
        />
      )}

      {/* DAY */}
      <Text
        style={{
          fontSize: 12,
          fontWeight: "600",
          color: selectedDay === item.day ? "#2E7D32" : "#111",
        }}
      >
        {item.day}
      </Text>

      {/* DATE */}
      <Text
        style={{
          fontSize: 11,
          color: selectedDay === item.day ? "#2E7D32" : "#666",
          marginTop: 2,
        }}
      >
        {item.date}
      </Text>

      {/* UNAVAILABLE */}
      {!item.available && (
        <Text style={{ fontSize: 9, color: "#999", marginTop: 2 }}>
          Unavailable
        </Text>
      )}
    </TouchableOpacity>
  ))}
</ScrollView>

        

<View
  style={{
    backgroundColor: "#F3F4F6",
    padding: 20,
    borderRadius: 16,
    marginTop: 12,    
    marginBottom: 12,
  }}
>
    {/* TIME */}
        <Text style={{ marginTop: 5,marginBottom:10, fontWeight: "600" }}>
          Select time of the day
        </Text>

  <View style={{ flexDirection: "row", gap: 8 }}>
    {timeSlots.map((slot, i) => (
      <TouchableOpacity
        key={i}
        disabled={!slot.available}
        onPress={() => setSelectedTime(slot.label)}
        style={{
          flex: 1,
          borderWidth: 1,
          borderRadius: 14,
          padding: 10,
          borderColor:
            selectedTime === slot.label ? "#2E7D32" : "#E5E7EB",
          backgroundColor:
            selectedTime === slot.label ? "#ECFDF5" : "#fff",
          opacity: slot.available ? 1 : 0.5,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          
          {/* RADIO */}
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              borderWidth: 2,
              borderColor:
                selectedTime === slot.label ? "#2E7D32" : "#9CA3AF",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {selectedTime === slot.label && (
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#2E7D32",
                }}
              />
            )}
          </View>

          {/* TEXT */}
          <View>
            <Text
              style={{
                fontWeight: "600",
                color: "#111",
              }}
            >
              {slot.label}
            </Text>

            <Text
              style={{
                fontSize: 12,
                color: "#6B7280",
              }}
            >
              {slot.time}
            </Text>

            {!slot.available && (
              <Text style={{ fontSize: 10, color: "#9CA3AF" }}>
                Unavailable
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    ))}
  </View>
</View>

        {/* QUANTITY */}
        <View style={{ marginTop: 20 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontWeight: "700" }}>Quantity</Text>
            <TouchableOpacity
  style={{
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#3B82F6",
    borderRadius: 999, // pill shape
    paddingVertical: 6,
    paddingHorizontal: 14,
    gap: 6,
  }}
>
  <Text
    style={{
      color: "#3B82F6",
      fontWeight: "600",
      fontSize: 14,
    }}
  >
    Add items
  </Text>

  {/* PLUS ICON CIRCLE */}
  <View
    style={{
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 1.5,
      borderColor: "#3B82F6",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Text style={{ color: "#3B82F6", fontSize: 12, fontWeight: "700" }}>
      +
    </Text>
  </View>
</TouchableOpacity>
          </View>

          <Text style={{ fontSize: 12, color: "#666", marginBottom: 10 }}>
            Minimum total order quantity 300kg*
          </Text>

          {/* ITEMS */}
          {parsedCart.items.map((item: any, index: number) => (
            <View
              key={`${parsedCart.supplierId}-${item.itemId}-${index}`}
              style={{
                backgroundColor: "#fff",
                padding: 12,
                borderRadius: 12,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: "#eee",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                
                {/* IMAGE */}
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: "#E6F4EA",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 10,
                  }}
                >
                  <Text>{item.emoji || "🥬"}</Text>
                </View>

                {/* NAME */}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "600" }}>{item.name}</Text>
                  <Text style={{ fontSize: 12, color: "#666" }}>₹28/kg</Text>
                </View>

                {/* ACTIONS */}
                {/* RIGHT SIDE (ALL IN ONE ROW) */}
<View
  style={{
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  }}
>
  {/* CUSTOM KG */}
  <View style={{ alignItems: "flex-end" }}>
    <TextInput
  value={quantities[index] || ""}
  onChangeText={(text) =>
    setQuantities((prev) => ({ ...prev, [index]: text }))
  }
  placeholder="Custom Kg"
  keyboardType="numeric"
  style={{
    borderBottomWidth: 1,
    borderBottomColor: "#2E7D32",
    color: "#2E7D32",
    minWidth: 60,
    textAlign: "right",
    paddingVertical: 2,
  }}
/>

    <Text style={{ fontWeight: "700" }}>
  ₹{(Number(quantities[index] || 0) * 28).toFixed(0)}
</Text>
  </View>

  {/* SAVE */}
  <TouchableOpacity style={{ alignItems: "center" }}>
    <Feather name="bookmark" size={18} color="#444" />
    <Text style={{ fontSize: 10, color: "#666" }}>
      Save
    </Text>
  </TouchableOpacity>

  {/* DELETE */}
  <TouchableOpacity style={{ alignItems: "center" }}>
    <Feather name="trash-2" size={18} color="#444" />
    <Text style={{ fontSize: 10, color: "#666" }}>
      Delete
    </Text>
  </TouchableOpacity>
</View>
              </View>

            </View>
          ))}
        </View>
      </ScrollView>

      {/* BOTTOM BAR */}
      <View
        style={{
          padding: 16,
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderColor: "#eee",
        }}
      >
        <View
  style={{
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  }}
>
  {/* LEFT TEXT */}
  <Text style={{ fontSize: 13, color: "#374151" }}>
    Deliver to:{" "}
    <Text style={{ fontWeight: "600", color: "#111" }}>
      North west, kanye west, ambalpady
    </Text>
  </Text>

  {/* RIGHT PILL */}
  <TouchableOpacity
    style={{
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#9CA3AF",
      borderStyle: "dashed", // 🔥 IMPORTANT
      borderRadius: 20,
      paddingVertical: 6,
      paddingHorizontal: 12,
      gap: 6,
    }}
  >
    <Text style={{ fontWeight: "600", color: "#111" }}>
      Store 1
    </Text>

    <Text style={{ color: "#16A34A", fontWeight: "600" }}>
      Change
    </Text>
  </TouchableOpacity>
</View>

        <TouchableOpacity
          onPress={async () => {
  try {
    const order = await submitOrder(parsedCart.supplierId);

    // Inside your checkout.tsx button onPress:
              console.log("Order success:", order);

              
              router.replace({ pathname: "/(supplier)/(tabs)/cart", params: { success: "true" } });

  } catch (err) {
    console.log(err);
    alert("Order failed. Try again.");
  }
}}
          style={{
            backgroundColor: "#2E7D32",
            padding: 16,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
            Place Order Request
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}