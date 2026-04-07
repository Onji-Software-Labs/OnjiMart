// Profile tab placeholder
/**
 * Retailer Profile Screen
 * ------------------------
 * Shows retailer account information fetched from API.
 */

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "@/lib/api/axiosConfig";

// ── API response type ──
interface RetailerProfile {
  retailerId: string;
  name: string;
  address: string;
  city: string;
  pincode: string;
  contactNumber: string;
  categoryIds: string[];
}

export default function RetailerProfileScreen() {
  const router = useRouter();

  const [profile, setProfile] = useState<RetailerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch profile on mount ──
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get jwtToken and phoneNumber from AsyncStorage
      const jwtToken = await AsyncStorage.getItem("jwtToken");
      const phoneNumber = await AsyncStorage.getItem("phoneNumber");
      const storedId = await AsyncStorage.getItem("userId");

      if (!jwtToken) {
        setError("Session expired. Please login again.");
        setLoading(false);
        return;
      }

      // ── Step 1: Call /all to get all retailer businesses ──
      const allResponse = await axiosInstance.get(`/api/retailer-business/all`,)
      
      if (!allResponse) {
        throw new Error(`Failed to fetch profile`);
      }

      const allData: RetailerProfile[] = await allResponse.data;
      console.log("✅ All retailer businesses:", JSON.stringify(allData, null, 2));
      console.log("🔍 Matching against phoneNumber:", phoneNumber);

      // ── Step 2: Find profile matching userId──
      const myProfile = allData.find(
       (b) => String(b.retailerId) === String(storedId)
      );

      if (myProfile) {
        // ── Step 3:set profile ──
          setProfile(myProfile);
      } else {
        console.warn("⚠️ No matching profile found.");
        console.warn("⚠️ phoneNumber in storage:", phoneNumber);
        console.warn("⚠️ All businesses:", JSON.stringify(allData, null, 2));
        setError("Retailer profile not found for this account.");
      }

    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ── Logout handler ──
  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.clear();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  // ── Loading State ──
  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  // ── Error State ──
  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#E53935" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProfile}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Full address string ──
  const fullAddress = [profile?.address, profile?.city, profile?.pincode]
    .filter(Boolean)
    .join(", ");

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#2E7D32" />
          <Text style={styles.headerTitle}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Card — API Data */}
      <View style={styles.profileCard}>
        <Image
          source={require("@/assets/images/3d_avatar_1.png")}
          style={styles.avatar}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.businessName}>
            {profile?.name ?? "—"}
          </Text>
          <Text style={styles.infoText}>
            {profile?.contactNumber ?? "—"}
          </Text>
          <Text style={styles.infoText}>
            {fullAddress || "—"}
          </Text>
          {profile && profile.categoryIds && profile.categoryIds.length > 0 && (
            <Text style={styles.categoryText}>
              {profile.categoryIds.join(", ")}
            </Text>
          )}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionItem}>
          <View style={styles.actionIconWrapper}>
            <Ionicons name="cart-outline" size={24} color="#333" />
            <View style={styles.badge} />
          </View>
          <Text style={styles.actionText}>Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <View style={styles.actionIconWrapper}>
            <Ionicons name="home-outline" size={24} color="#333" />
          </View>
          <Text style={styles.actionText}>Help</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <View style={styles.actionIconWrapper}>
            <Ionicons name="card-outline" size={24} color="#333" />
          </View>
          <Text style={styles.actionText}>Payments</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <Ionicons name="person-add-outline" size={20} color="#2E7D32" />
            <Text style={styles.menuText}>Requests sent</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <Ionicons name="location-outline" size={20} color="#2E7D32" />
            <Text style={styles.menuText}>Manage addresses</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <Ionicons name="heart-outline" size={20} color="#2E7D32" />
            <Text style={styles.menuText}>Favourites</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <Ionicons name="share-social-outline" size={20} color="#2E7D32" />
            <Text style={styles.menuText}>Share the app</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]}>
          <View style={styles.menuLeft}>
            <Ionicons name="information-circle-outline" size={20} color="#2E7D32" />
            <Text style={styles.menuText}>About us</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Log out */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#555",
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#E53935",
    textAlign: "center",
    marginHorizontal: 32,
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: "#2E7D32",
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  header: {
    paddingTop: 55,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#F5F5F5",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E7D32",
  },
  profileCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  businessName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  infoText: {
    fontSize: 13,
    color: "#555",
    lineHeight: 19,
  },
  categoryText: {
    fontSize: 12,
    color: "#2E7D32",
    fontWeight: "500",
    marginTop: 2,
  },
  quickActions: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionItem: {
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  actionIconWrapper: {
    position: "relative",
    width: 44,
    height: 44,
    backgroundColor: "#F0F8F0",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2E7D32",
  },
  actionText: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
  },
  menuContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuText: {
    fontSize: 15,
    color: "#1A1A1A",
    fontWeight: "400",
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 40,
    alignItems: "center",
    paddingVertical: 12,
  },
  logoutText: {
    fontSize: 16,
    color: "#E53935",
    fontWeight: "600",
  },
});