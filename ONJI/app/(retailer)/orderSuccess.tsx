import { useRouter } from "expo-router";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function OrderSuccess() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
      
      {/* CENTER */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
        }}
      >
        {/* TICK */}
        <View
          style={{
            width: 90,
            height: 90,
            borderRadius: 45,
            backgroundColor: "#6AA84F",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Ionicons name="checkmark" size={50} color="#fff" />
        </View>

        {/* TITLE */}
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: "#2E7D32",
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          Your order request has been{"\n"}
          sent to Sunways trading.
        </Text>

        {/* SUBTEXT */}
        <Text
          style={{
            fontSize: 13,
            color: "#555",
            textAlign: "center",
            marginBottom: 25,
            lineHeight: 20,
          }}
        >
          You will be notified once it is approved. You can also{"\n"}
          track it in the Orders section
        </Text>

        {/* BUTTON  */}
        <TouchableOpacity
          onPress={() => router.replace("/(supplier)/(tabs)/cart")}
          style={{
            backgroundColor: "#5A7F41",
            paddingVertical: 16,
            paddingHorizontal: 40,
            borderRadius: 14,
            minWidth: 250,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
            Go back to Cart
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}