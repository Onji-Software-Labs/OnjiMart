import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { fulfillOrder, generateInvoice } from "@/lib/api/order";
import { secureStorage } from "@/lib/secureStorage";
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
  router.navigate({
    pathname: "/(supplier)/orderDetails",
    params: { orderId },
  });  };

const fulfilledRef = useRef(false);

const handleConfirm = async () => {
  if (loading) return;

  try {
    setLoading(true);

    // 1. Fulfill (skipped on retry if it already succeeded)
    if (!fulfilledRef.current) {
      const res = await fulfillOrder(orderId);
      console.log("Fulfill Response:", res);
      fulfilledRef.current = true;
    }

    // 2. Generate the invoice
    const supplierId = await secureStorage.getItem("userId");
    if (!supplierId) throw new Error("Supplier ID not found");

    const invoice = await generateInvoice(supplierId, orderId);
    console.log("Invoice generated:", invoice);

    setShowConfirmModal(false);
    setShowSuccessModal(true);
  } catch (error: any) {
    console.error(
      "Confirm order error:",
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
              fontSize: 16,
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
              width: "89%",

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
                size={30}
                color="#0B6623"
              />
            </View>

            {/* Title */}

            <Text
              style={{
                marginTop: 16,
                textAlign: "center",
                fontSize: 15,
                fontWeight: "700",
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
                fontSize: 14,
                color: "#000000a1",
                lineHeight: 16,
                fontWeight: "400",

              }}
            >
              Are you sure you want to confirm this order
              and send the invoice to the retailer?
            </Text>

            {/* Secondary Description */}

            <Text
              style={{
                marginTop: 14,
                textAlign: "center",
                fontSize: 10,
                color: "#00000088",
                lineHeight: 15,
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
                    fontSize: 14,
                    fontWeight: "500",
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
                  backgroundColor: "#d0e5d07f",
                  borderRadius: 10,
                  justifyContent: "center",
                  alignItems: "center",
                  marginLeft: 8,
                }}
              >
                <Text
                  style={{
                    color: "#111",
                    fontSize: 14,
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
      width: "89%",
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
      <Feather name="check" size={30} color="#0B6623" />
    </View>

    {/* Title */}
    <Text
      style={{
        marginTop: 16,
        textAlign: "center",
        fontSize: 15,
        fontWeight: "700",
        color: "#2E7D32",
      }}
    >
      Order Confirmed
    </Text>

    {/* Main Description */}
    <Text
      style={{
        marginTop: 16,
        textAlign: "center",
        fontSize: 14,
        color: "#000000a1",
        lineHeight: 16,
        fontWeight: "400",
      }}
    >
      The order has been successfully confirmed
      and moved to the processing stage.
    </Text>

    {/* Secondary Description */}
    <Text
      style={{
        marginTop: 14,
        textAlign: "center",
        fontSize: 10,
        color: "#00000088",
        lineHeight: 15,
      }}
    >
      Once confirmed, the retailer will receive the{"\n"}
      invoice and the order will be marked as confirmed.
    </Text>

    {/* Buttons */}
    <View style={{ flexDirection: "row", marginTop: 24 }}>
      {/* Go to Invoice */}
      <TouchableOpacity
        onPress={() => router.push("/(supplier)/(tabs)/invoice")}
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
        <Text style={{ color: "#FFF", fontSize: 14, fontWeight: "500" }}>
          Go to Invoice
        </Text>
      </TouchableOpacity>

      {/* Order Details */}
      <TouchableOpacity
        onPress={handleCancel}
        style={{
          flex: 1,
          height: 50,
          backgroundColor: "#d0e5d07f",
          borderRadius: 10,
          justifyContent: "center",
          alignItems: "center",
          marginLeft: 8,
        }}
      >
        <Text style={{ color: "#111", fontSize: 14, fontWeight: "500" }}>
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
