
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "@/lib/api/axiosConfig";
import { useLocalSearchParams, useRouter } from "expo-router";

interface Supplier {
  name: string;
  ownerName: string;
  category: string;
  location: string;
}

const windowWidth = Dimensions.get("window").width;

const ConnectScreen = () => {
  const router = useRouter();
  const { supplierId, businessId } = useLocalSearchParams();
  console.log("SupplierId:", supplierId);
  console.log("BusinessId:", businessId);

  const [isConnected, setIsConnected] = useState(false);
  const [supplier, setSupplier] = useState<Supplier | null>(null);

  
  const connectScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
  const fetchSupplierDetails = async () => {
    try {

      const response = await axiosInstance.get(
        `/api/supplier-business/${businessId}`
      );

      console.log("Supplier business data:", response.data);

      const supplierData = response.data;

      setSupplier({
        name: supplierData.name,
        ownerName: supplierData.contactNumber,
        category: "Fruits",
        location: supplierData.city,
      });

    } catch (error) {
      console.log("Supplier fetch error:", error);
    }
  };

  if (businessId && typeof businessId === "string") {
    fetchSupplierDetails();
  }

}, [businessId]);

      useEffect(() => {
      const checkConnectionStatus = async () => {
        try {
          const retailerId = await AsyncStorage.getItem("userId");

          const response = await axiosInstance.get(
            "/api/connections/status",
            {
              params: {
                retailerId,
                supplierId,
              },
            }
          );

          const status = response?.data?.status;

          setIsConnected(status === "ACCEPTED" || status === "PENDING");

        } catch (error) {
          console.log("Status check error:", error);
        }
      };

      if (supplierId) {
        checkConnectionStatus();
      }
    }, [supplierId]);


  const handlePress = async () => {
  try {

    const retailerId = await AsyncStorage.getItem("userId");

    console.log("Retailer:", retailerId);
    console.log("Supplier:", supplierId);

    if (!isConnected) {

      await axiosInstance.post("/api/connections/connect", null, {
        params: {
          retailerId,
          supplierId: supplierId,
        },
      });

      console.log("Connect success");

      setIsConnected(true);

    } else {

      await axiosInstance.delete("/api/connections/cancel", {
        params: {
          retailerId,
          supplierId: supplierId,
        },
      });

      setIsConnected(false);
    }

  } catch (error) {
    console.log("Connection error:", error);
  }
};

  const handlePressIn = () => {
    Animated.timing(connectScale, {
      toValue: 0.95,
      duration: 100,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(connectScale, {
      toValue: 1,
      duration: 100,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        
        {/* Back */}
        <TouchableOpacity
          style={{ marginLeft: 10 }}
          onPress={() => router.back()}
        >
          <Image source={require("../../assets/images/arrow_back.png")} />
        </TouchableOpacity>

        {/* Top Section */}
        <View style={styles.topSection}>
          <Text style={styles.sectionTitle}>Business Information</Text>

          <View style={styles.card}>
            
            {/* Row */}
            <View style={{ flexDirection: "row" }}>
              
              {/* Profile */}
              <View style={{ position: "relative" }}>
                <Image
                  source={require("../../assets/images/3davatar.png")}
                  style={styles.profileImage}
                />

                <View style={styles.badge}>
                  <MaterialCommunityIcons
                    name="account-group"
                    size={12}
                    color="white"
                  />
                </View>
              </View>

              {/* Info */}
              <View style={styles.info}>
                <View style={styles.titleRow}>
                  <Text style={styles.companyName}>{supplier?.name}</Text>

                  <View style={styles.rating}>
                    <FontAwesome name="star" size={14} color="#0F9D58" />
                    <Text style={{ color: "#0F9D58", marginLeft: 4 }}>
                      4.5 (6)
                    </Text>
                  </View>
                </View>

                <Text>{supplier?.ownerName}</Text>

                <Text style={styles.textGray}>Category : {supplier?.category}</Text>

                <View style={styles.row}>
                  <Entypo name="star" size={10} color="grey" />
                  <Text style={styles.textGray}> Verified user: 2 years</Text>
                </View>

                <View style={styles.row}>
                  <AntDesign name="checkcircleo" size={12} color="grey" />
                  <Text style={styles.textGray}> GST: 03BOMPS0736L2ZM</Text>
                </View>

                <View style={styles.row}>
                  <EvilIcons name="location" size={20} color="grey" />
                  <Text>{supplier?.location}</Text>
                </View>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Delivery + Button */}
            <View style={styles.deliveryRow}>
              <View>
                <Text style={styles.textGray}>Delivery: 2–3 days</Text>

                <View style={styles.row}>
                  <MaterialCommunityIcons
                    name="cube-outline"
                    size={16}
                    color="#6B7280"
                  />
                  <Text style={{ marginLeft: 4, color: "#6B7280" }}>
                    12/04/25
                  </Text>
                </View>
              </View>

              {/* Button */}
              <TouchableOpacity
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
              >
                {!isConnected ? (
                  <Animated.View
                    style={[
                      styles.connectButton,
                      { transform: [{ scale: connectScale }] },
                    ]}
                  >
                    <Text style={styles.connectText}>Connect</Text>
                    <MaterialCommunityIcons
                      name="account-plus"
                      size={20}
                      color="#0F9D58"
                    />
                  </Animated.View>
                ) : (
                  <Animated.View
                    style={[
                      styles.connectButton,
                      { borderColor: "#D1D5DB", transform: [{ scale: connectScale }] },
                    ]}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                    <Entypo name="cross" size={20} color="#6B7280" />
                  </Animated.View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Bottom */}
        <View style={{ width: windowWidth }}>
          {!isConnected ? (
            <View style={{ alignItems: "center" }}>
              <Image
                source={require("../../assets/images/Lock.png")}
                style={{ marginVertical: 10 }}
              />
              <Text style={styles.lockText}>
                Connect with supplier to start placing orders
              </Text>
            </View>
          ) : (
            <View style={{ alignItems: "center" }}>
              <Image
                source={require("../../assets/images/IconClock.png")}
                style={{ marginVertical: 10 }}
              />
              <Text style={styles.lockText}>Connection request sent</Text>
              <Text style={{ color: "#9CA3AF" }}>
                Great things are coming your way with this supplier
              </Text>
            </View>
          )}

          <Image
            source={require("../../assets/images/fruits-vegetables-background-style 1.png")}
            style={{ width: windowWidth }}
            resizeMode="cover"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  topSection: {
    backgroundColor: "#F6E7F1",
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  sectionTitle: {
    marginLeft: 16,
    marginTop: 10,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    width: "90%",
    alignSelf: "center",
    marginTop: 10,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  badge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#22C55E",
    borderRadius: 10,
    padding: 4,
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  companyName: {
    fontSize: 20,
    fontWeight: "600",
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
  },
  textGray: {
    color: "#6B7280",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 10,
  },
  deliveryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  connectButton: {
    borderWidth: 0.5,
    borderColor: "#0F9D58",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  connectText: {
    color: "#0F9D58",
    marginRight: 6,
  },
  cancelText: {
    color: "#6B7280",
    marginRight: 6,
  },
  lockText: {
    fontSize: 18,
    color: "#9CA3AF",
    fontWeight: "600",
    textAlign: "center",
  },
});

export default ConnectScreen;