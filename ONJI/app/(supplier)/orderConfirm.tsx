import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { fulfillOrder } from "@/lib/api/order";

export default function OrderConfirm() {

  const { orderId } = useLocalSearchParams<{
    orderId: string;
  }>();

  /*
  ===================================
  STATES
  ===================================
  */

  const [showConfirmModal, setShowConfirmModal] = useState(true);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [loading, setLoading] = useState(false);

  /*
  ===================================
  HANDLERS
  ===================================
  */

  const handleCancel = () => {
    router.back();
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);

      console.log("Order ID:", orderId);

      const res = await fulfillOrder(orderId);

      console.log("Fulfill Response:", res);

      setShowConfirmModal(false);
      setShowSuccessModal(true);

    } catch (error: any) {
      console.error(
        "Fulfill Order error:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

    /*
    Future API:

    setLoading(true);

    try {

      await confirmOrder();

      setShowConfirmModal(false);

      setShowSuccessModal(true);

    }

    finally {

      setLoading(false);

    }
    */
  

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#F8F9F6",
      }}
    >
      <StatusBar
        backgroundColor="#F8F9F6"
        barStyle="dark-content"
      />

      {/* ===================================== */}
      {/* BACKGROUND */}
      {/* ===================================== */}

      <View
        style={{
          flex: 1,
        }}
      >

        {/* HEADER */}

        <View
          style={{
            paddingHorizontal: 24,
            paddingTop: 20,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: "#2E7D32",
            }}
          >
            Order Requests
          </Text>
        </View>

        {/* CARD 1 */}

        <View
          style={{
            marginHorizontal: 20,
            marginTop: 24,

            height: 150,

            backgroundColor: "#FFFFFF",

            borderRadius: 24,
          }}
        />

        {/* CARD 2 */}

        <View
          style={{
            marginHorizontal: 20,
            marginTop: 18,

            height: 260,

            backgroundColor: "#FFFFFF",

            borderRadius: 24,
          }}
        />

        {/* CARD 3 */}

        <View
          style={{
            marginHorizontal: 20,
            marginTop: 18,

            height: 220,

            backgroundColor: "#FFFFFF",

            borderRadius: 24,
          }}
        />

        {/* BOTTOM TAB */}

        <View
          style={{
            position: "absolute",

            left: 0,
            right: 0,
            bottom: 0,

            height: 88,

            backgroundColor: "#FFFFFF",
          }}
        />

      </View>

      {/* ===================================== */}
      {/* DIM OVERLAY */}
      {/* ===================================== */}

      <View
      style={{
      position:"absolute",
      top:95,
      left:0,
      right:0,
      bottom:0,
      backgroundColor:"rgba(0,0,0,0.18)",
      }}
      />

      {/* ===================================== */}
      {/* MODAL LAYER */}
      {/* ===================================== */}

      <View
        style={{
          position: "absolute",

          top: 0,
          left: 0,
          right: 0,
          bottom: 0,

          justifyContent: "center",

          alignItems: "center",
        }}
      >

        {showConfirmModal && (

          <View
            style={{
              width: "84%",

              backgroundColor: "#FFFFFF",

              borderRadius: 18,

              paddingHorizontal: 28,

              paddingVertical: 24,

              shadowColor: "#000",

              shadowOpacity: 0.08,

              shadowRadius: 12,

              elevation: 8,
            }}
          >

            

            {/* Icon */}

            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 12,
                backgroundColor: "#F5F8F3",
                justifyContent: "center",
                alignItems: "center",
                alignSelf: "center",
              }}
            >
              <Feather
                name="map-pin"
                size={34}
                color="#0B6623"
              />
            </View>

            {/* Title */}

            <Text
              style={{
                marginTop: 16,
                textAlign: "center",
                fontSize: 20,
                fontWeight: "800",
                color: "#2E7D32",
              }}
            >
              Confirm Order & Send Invoice
            </Text>

            {/* Main Description */}

            <Text
              style={{
                marginTop: 16,
                textAlign: "center",
                fontSize: 16,
                color: "#333",
                lineHeight: 26,
              }}
            >
              Are you sure you want to confirm this order{"\n"}
              and send the invoice to the retailer?
            </Text>

            {/* Secondary Description */}

            <Text
              style={{
                marginTop: 14,
                textAlign: "center",
                fontSize: 14,
                color: "#7A7A7A",
                lineHeight: 22,
              }}
            >
              Once confirmed, the retailer will receive the{"\n"}
              invoice and the order will be marked as confirmed.
            </Text>

            {/* Buttons */}

            <View
              style={{
                flexDirection: "row",
                marginTop: 24,
              }}
            >

              {/* Confirm */}

              <TouchableOpacity
                onPress={handleConfirm}
                disabled={loading}
                style={{
                  flex: 1,
                  height: 50,
                  backgroundColor: "#2E7D32",
                  borderRadius: 10,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 8,
                }}
              >
                <Text
                  style={{
                    color: "#FFF",
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  Confirm Order
                </Text>
              </TouchableOpacity>

              {/* Cancel */}

              <TouchableOpacity
                onPress={handleCancel}
                style={{
                  flex: 1,
                  height: 50,
                  backgroundColor: "#E7EFE5",
                  borderRadius: 10,
                  justifyContent: "center",
                  alignItems: "center",
                  marginLeft: 8,
                }}
              >
                <Text
                  style={{
                    color: "#111",
                    fontSize: 16,
                    fontWeight: "500",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        )}

        {showSuccessModal && (

          <View
          style={{
            width: "84%",
            backgroundColor: "#FFFFFF",
            borderRadius: 18,
            paddingHorizontal: 28,
            paddingVertical: 24,
          }}
          >

          <View
          style={{
          width:84,
          height:84,
          borderRadius:42,

          backgroundColor:"#E6F2E6",

          borderWidth:4,
          borderColor:"#B7D9B7",

          justifyContent:"center",
          alignItems:"center",

          alignSelf:"center",
          }}
          >

          <Feather
          name="check"
          size={42}
          color="#2E7D32"
          />

          </View>

          <Text
          style={{
          marginTop:12,
          textAlign:"center",
          fontSize:20,
          fontWeight:"800",
          color:"#2E7D32",
          }}
          >
          Order Confirmed
          </Text>

          <Text
            style={{
            marginTop:16,
            textAlign:"center",
            fontSize:18,
            color:"#333",
            lineHeight:24,
            }}
            >
            The order has been successfully confirmed{"\n"}
            and moved to the processing stage.
            </Text>

            <Text
            style={{
            marginTop:14,
            textAlign:"center",
            fontSize:14,
            color:"#7A7A7A",
            lineHeight:24,
            }}
            >
            Once confirmed, the retailer will receive the invoice{"\n"}
            and the order will be marked as confirmed.
            </Text>

          <View
          style={{
          flexDirection:"row",
          marginTop:36,
          }}
        >

          <TouchableOpacity
          onPress={() => router.push("/(supplier)/(tabs)/invoice")}
          style={{
            flex:1,
            height:54,
            backgroundColor:"#2E7D32",
            borderRadius:14,
            justifyContent:"center",
            alignItems:"center",
            marginRight:8,
          }}
          >
          <Text
          style={{
          color:"#FFF",
          fontSize:16,
          fontWeight:"600",
          }}
          >
          Go to Invoice
          </Text>
          </TouchableOpacity>

          

          <TouchableOpacity
          onPress={() => router.back()}
          style={{
            flex:1,
            height:54,
            backgroundColor:"#E7EFE5",
            borderRadius:14,
            justifyContent:"center",
            alignItems:"center",
            marginLeft:8,
            }}
          >
          <Text
          style={{
          color:"#111",
          fontSize:16,
          fontWeight:"500",
          }}
          >
          Order Details
          </Text>
          </TouchableOpacity>

          </View>

          </View>

          )}

      </View>
    </SafeAreaView>
  );
}
