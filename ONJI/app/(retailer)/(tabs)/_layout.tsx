// Retailer Tabs Layout
import { Tabs } from "expo-router";
import { View, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

function TabIcon({
  name,
  focused,
}: {
  name: IoniconsName;
  focused: boolean;
}) {
  return (
    <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
      <Ionicons
        name={name}
        size={20}
        color={focused ? "#2E7D32" : "#757575"}
      />
    </View>
  );
}

export default function RetailerTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2E7D32",
        tabBarInactiveTintColor: "#757575",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginBottom: Platform.OS === "ios" ? 0 : 4,
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E8E8E8",
          height: Platform.OS === "ios" ? 85 : 76,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 24 : 16,
        },
        tabBarItemStyle: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        },
      }}
    >
      {/* ── Visible 4 tabs ── */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "700",
            color: "#1A1A1A",
            marginTop: 2,
            marginBottom: Platform.OS === "ios" ? 0 : 4,
          },
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home-outline" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="supplier"
        options={{
          title: "Supplier",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="person-circle-outline" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="cart-outline" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="invoice"
        options={{
          title: "Invoice",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="receipt-outline" focused={focused} />
          ),
        }}
      />

      {/* ── Hidden tabs ── */}
      <Tabs.Screen name="profile"     options={{ href: null }} />
      <Tabs.Screen name="orders"      options={{ href: null }} />
      <Tabs.Screen name="home_new"    options={{ href: null }} />
      <Tabs.Screen name="_layout_new" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    width: 40,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  iconWrapperActive: {
    backgroundColor: "#E8F5E9",
  },
});