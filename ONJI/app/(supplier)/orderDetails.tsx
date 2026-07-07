import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import axiosInstance from "@/lib/api/axiosConfig";

const AVATAR = require("../../assets/images/3davatar.png");
import { useState } from "react";

export default function OrderDetails() {

    const { orderId } = useLocalSearchParams();
    console.log("ORDER ID:", orderId);
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [showEditedOrder, setShowEditedOrder] = useState(false);
    const [hasEditedOrder, setHasEditedOrder] = useState(false);
    const disableActions = hasEditedOrder && !showEditedOrder;

    const fetchOrderDetails = async () => {
    try {
        const res = await axiosInstance.get(
        `/api/orders/${orderId}`
        );

        console.log("ORDER DETAILS");
        console.log(res.data);

        setOrder(res.data);

        setItems(
        res.data.items.map((item: any) => ({
            id: item.id,
            name: item.productName,
            quantity: String(item.requestedQuantity),
            price: String(item.unitPrice),
            emoji: "📦",
        }))
        );
    } catch (err) {
        console.log(err);
    } finally {
        setLoading(false);
    }
    };

    
    const [items, setItems] = useState<any[]>([
    {
        id: 1,
        name: "Roma Tomatoes",
        emoji: "🍅",
        quantity: "45",
        price: "90",
    },
    {
        id: 2,
        name: "Red Onions",
        emoji: "🧅",
        quantity: "45",
        price: "90",
    },
    {
        id: 3,
        name: "Roma Tomatoes",
        emoji: "🍅",
        quantity: "45",
        price: "90",
    },
    ]);

    const [originalItems, setOriginalItems] = useState(
        items.map(item => ({ ...item }))
    );

    const [oldItems] = useState(
        items.map(item => ({ ...item }))
    );

    useEffect(() => {
    if (orderId) {
        fetchOrderDetails();
    }
    }, [orderId]);

    if (loading) {
    return (
        <SafeAreaView
        style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        }}
        >
        <Text>Loading...</Text>
        </SafeAreaView>
    );
    }

    console.log("ORDER STATE");
    console.log(order);

    const orderDate = order?.orderDate
    ? new Date(order.orderDate)
    : null;

    const formattedDate = orderDate
    ? orderDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        })
    : "-";

    const formattedTime = orderDate
    ? orderDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        })
    : "-";

    const handleFulfillOrder = () => {
        router.push("./orderConfirm");
    };

  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
  >
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#F8F9F6",
      }}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8F9F6"
      />

      {/* HEADER */}

        <View
        style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingTop: 6,
            paddingBottom: 12,
        }}
        >
        <TouchableOpacity
            onPress={() => router.back()}
            style={{
            marginRight: 16,
            }}
        >
            <Feather
            name="arrow-left"
            size={30}
            color="#1F7A34"
            />
        </TouchableOpacity>

        <Text
            style={{
            fontSize: 22,
            fontWeight: "500",
            color: "#1F7A34",
            }}
        >
            Order Details
        </Text>
        </View>

        <View
        style={{
            height: 1,
            backgroundColor: "#E5E7EB",
        }}
        />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={{
            paddingTop: 18,
            paddingBottom: 40,
        }}
    >
        

        {/* CONTENT START */}

        <View
          style={{
            paddingHorizontal: 18,
          }}
        >
          {/* ORDER SUMMARY CARD */}

            <View
            style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 18,
                paddingVertical: 18,
                paddingHorizontal: 10,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
            }}
            >
            {/* Order ID */}

            <View
                style={{
                flex: 1,
                alignItems: "center",
                }}
            >
                <Text
                style={{
                    fontSize: 12,
                    color: "#9CA3AF",
                    marginBottom: 8,
                }}
                >
                Order Id
                </Text>

                <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                }}
                >
                <Text
                    style={{
                    fontWeight: "700",
                    fontSize: 14,
                    color: "#111827",
                    }}
                >
                    #{order?.id?.slice(0, 8).toUpperCase()}
                </Text>

                <Feather
                    name="copy"
                    size={14}
                    color="#1F7A34"
                    style={{ marginLeft: 5 }}
                />
                </View>

                <View
                style={{
                    backgroundColor: "#F3F4F6",
                    paddingHorizontal: 16,
                    paddingVertical: 6,
                    borderRadius: 20,
                    marginTop: 10,
                }}
                >
                <Text
                    style={{
                    fontSize: 13,
                    color: "#6B7280",
                    }}
                >
                    {order?.totalOrderItems ?? 0} items
                </Text>
                </View>
            </View>

            {/* Divider */}

            <View
                style={{
                width: 1,
                height: 80,
                backgroundColor: "#E5E7EB",
                }}
            />

            {/* Order Placed */}

            <View
                style={{
                flex: 1,
                alignItems: "center",
                }}
            >
                <Text
                style={{
                    fontSize: 12,
                    color: "#9CA3AF",
                    marginBottom: 8,
                }}
                >
                Order Placed
                </Text>

                <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                }}
                >
                <Text
                    style={{
                    fontWeight: "600",
                    fontSize: 14,
                    }}
                >
                    {formattedDate}
                </Text>

                <Feather
                    name="calendar"
                    size={14}
                    color="#1F7A34"
                    style={{ marginLeft: 5 }}
                />
                </View>

                <Text
                style={{
                    marginTop: 12,
                    color: "#6B7280",
                }}
                >
                {formattedTime}
                </Text>
            </View>

            {/* Divider */}

            <View
                style={{
                width: 1,
                height: 80,
                backgroundColor: "#E5E7EB",
                }}
            />

            {/* Delivery */}

            <View
                style={{
                flex: 1,
                alignItems: "center",
                }}
            >
                <Text
                style={{
                    fontSize: 12,
                    color: "#9CA3AF",
                    marginBottom: 8,
                }}
                >
                Est. Delivery
                </Text>

                <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                }}
                >
                <Text
                    style={{
                    fontWeight: "600",
                    fontSize: 14,
                    }}
                >
                    <Text
                    style={{
                        fontWeight: "600",
                        fontSize: 14,
                    }}
                    >
                    {order?.deliveryDate
                        ? new Date(order.deliveryDate).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                        })
                        : "-"}
                    </Text>
                </Text>

                <Feather
                    name="truck"
                    size={14}
                    color="#1F7A34"
                    style={{ marginLeft: 5 }}
                />
                </View>

                <Text
                style={{
                    marginTop: 12,
                    color: "#6B7280",
                }}
                >
                {order?.deliveryTimeSlot ?? "-"}
                </Text>
            </View>
            </View>

            {/* GAP */}

            <View style={{ height: 18 }} />
            {hasEditedOrder && (
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginVertical: 12,
                }}
                >
                <Text
                    style={{
                    fontSize: 14,
                    color: "#555",
                    }}
                >
                    Old Order
                </Text>

                <Switch
                    value={showEditedOrder}
                    onValueChange={(value) => {
                        setIsEditing(false);
                        setShowEditedOrder(value);
                    }}
                    trackColor={{
                        false: "#D1D5DB",
                        true: "#22C55E",
                    }}
                    thumbColor="#FFFFFF"
                />

                <Text
                    style={{
                    fontSize: 14,
                    color: "#555",
                    }}
                >
                    Edited Order
                </Text>
            </View>
            )}

            {/* RETAILER CARD */}

            <View
            style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 18,
                padding: 18,
            }}
            >
            {/* Top Row */}

            <View
                style={{
                flexDirection: "row",
                alignItems: "center",
                }}
            >

                <Image
                    source={AVATAR}
                    style={{
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        backgroundColor: "#D9F99D",
                    }}
                    resizeMode="cover"
                    />

                <View
                style={{
                    marginLeft: 12,
                    flex: 1,
                }}
                >
                <Text
                    style={{
                    fontSize: 24,
                    fontWeight: "600",
                    color: "#222",
                    }}
                >
                    {order?.retailerName || order?.shopName}
                </Text>

                <View
                    style={{
                    flexDirection: "row",
                    marginTop: 6,
                    alignItems: "center",
                    }}
                >
                    <View
                    style={{
                        backgroundColor: "#F3F4F6",
                        borderRadius: 20,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                    }}
                    >
                    <Text
                        style={{
                        color: "#6B7280",
                        fontSize: 13,
                        }}
                    >
                        {order?.retailerPhoneNumber ?? "-"}
                    </Text>
                    </View>

                    <View
                    style={{
                        backgroundColor: "#F3F4F6",
                        borderRadius: 20,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        marginLeft: 8,
                    }}
                    >
                    <Text
                        style={{
                        color: "#6B7280",
                        fontSize: 13,
                        }}
                    >
                        Retailer
                    </Text>
                    </View>
                </View>
                </View>
            </View>

            {/* Address */}

            <View
                style={{
                marginTop: 18,
                backgroundColor: "#F6F8F4",
                borderRadius: 16,
                padding: 14,
                flexDirection: "row",
                }}
            >
                <Feather
                name="map-pin"
                size={20}
                color="#1F7A34"
                />

                <Text
                style={{
                    marginLeft: 10,
                    flex: 1,
                    color: "#555",
                    fontSize: 16,
                }}
                >
                {order?.retailerAddress ?? "-"}
                </Text>
            </View>

            {/* Stats */}

            <View style={{ marginTop: 20 }}>
                <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 14,
                }}
                >
                <Text
                    style={{
                    color: "#666",
                    fontSize: 18,
                    }}
                >
                    Total order Items
                </Text>

                <Text
                    style={{
                    fontWeight: "700",
                    fontSize: 20,
                    }}
                >
                    {order?.totalOrderItems ?? 0}
                </Text>
                </View>

                <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                }}
                >
                <Text
                    style={{
                    color: "#666",
                    fontSize: 18,
                    }}
                >
                    Vendor ID
                </Text>

                <View
                    style={{
                    flexDirection: "row",
                    alignItems: "center",
                    }}
                >
                    <Text
                    style={{
                        fontWeight: "700",
                        fontSize: 20,
                    }}
                    >
                    {order?.retailerId
                        ? order.retailerId.slice(0, 8).toUpperCase()
                        : "-"}
                    </Text>

                    <Feather
                    name="copy"
                    size={16}
                    color="#1F7A34"
                    style={{ marginLeft: 5 }}
                    />
                </View>
                </View>
            </View>

            {/* Divider */}

            <View
                style={{
                borderTopWidth: 1,
                borderStyle: "dashed",
                borderColor: "#DDD",
                marginVertical: 18,
                }}
            />

            {/* Price */}

            <View
                style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 12,
                }}
            >
                <Text
                style={{
                    fontSize: 18,
                    color: "#555",
                }}
                >
                Subtotal
                </Text>

                <Text
                style={{
                    fontSize: 18,
                }}
                >
                ₹{order?.subtotal?.toLocaleString() ?? 0}
                </Text>
            </View>

            <View
                style={{
                flexDirection: "row",
                justifyContent: "space-between",
                }}
            >
                <Text
                style={{
                    fontSize: 18,
                    color: "#555",
                }}
                >
                Tax (GST 5%)
                </Text>

                <Text
                style={{
                    fontSize: 18,
                }}
                >
                ₹{order?.taxAmount?.toLocaleString() ?? 0}
                </Text>
            </View>

            <View
                style={{
                borderTopWidth: 1,
                borderColor: "#EEE",
                marginVertical: 18,
                }}
            />

            <View
                style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                }}
            >
                <Text
                style={{
                    fontSize: 22,
                    fontWeight: "700",
                }}
                >
                Grand Total
                </Text>

                <Text
                style={{
                    fontSize: 32,
                    color: "#1F7A34",
                    fontWeight: "800",
                }}
                >
                ₹{order?.grandTotal?.toLocaleString() ?? 0}
                </Text>
            </View>
            </View>

            {/* GAP */}

            <View style={{ height: 18 }} />

            {/* ORDER ITEMS */}

            <View
            style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 18,
                overflow: "hidden",
            }}
            >
            {/* Header */}

            <View
            style={{
            padding:18,
            }}
            >

            <View
            style={{
            flexDirection:"row",
            justifyContent:"space-between",
            alignItems:"center",
            }}
            >

            <Text
            style={{
            fontSize:20,
            fontWeight:"500",
            color:"#333",
            }}
            >
            {isEditing ? "Edit Item Details" : "Order Items"}
            </Text>

            {!isEditing && (

            <TouchableOpacity
            disabled={hasEditedOrder && !showEditedOrder}
            onPress={() => {
                if (hasEditedOrder && !showEditedOrder) return;

                setOriginalItems(
                    items.map(item => ({ ...item }))
                );

                setIsEditing(true);
            }}
            style={{
            flexDirection:"row",
            alignItems:"center",
            }}
            >

            <Text
            style={{
            color:
            hasEditedOrder && !showEditedOrder
            ? "#9CA3AF"
            : "#3B82F6",
            fontSize:16,
            marginRight:6,
            }}
            >
            Edit order items
            </Text>

            <Feather
            name="plus-circle"
            size={18}
            color={
            hasEditedOrder && !showEditedOrder
            ? "#9CA3AF"
            : "#3B82F6"
            }
            />
            </TouchableOpacity>

            )}

            </View>

            {isEditing && (

            <Text
            style={{
            marginTop:8,
            fontSize:14,
            color:"#6B7280",
            lineHeight:20,
            }}
            >
            Manage quantity and pricing for this specific delivery
            </Text>

            )}

            </View>

           {items.map((item) => (
                <View
                key={item.id}
                style={{
                borderTopWidth:1,
                borderColor:"#F1F1F1",
                padding:18,
                }}
                >

                <View
                style={{
                flexDirection:"row",
                alignItems:"center",
                }}
                >

                <View
                style={{
                width:50,
                height:50,
                borderRadius:25,
                backgroundColor:"#F3F4F6",
                justifyContent:"center",
                alignItems:"center",
                }}
                >
                <Text style={{fontSize:28}}>
                {item.emoji}
                </Text>
                </View>

                <View
                style={{
                flex:1,
                marginLeft:14,
                }}
                >

                <Text
                style={{
                fontSize:18,
                fontWeight:"600",
                }}
                >
                {item.name}
                </Text>

                {!isEditing ? (

                    <Text
                    style={{
                    marginTop:4,
                    color:"#777",
                    }}
                    >
                    {item.quantity} kg × ₹{item.price}/kg
                    </Text>

                    ) : (

                    <View
                    style={{
                    marginTop:12,
                    }}
                    >

                    <View
                    style={{
                    flexDirection:"row",
                    justifyContent:"space-between",
                    }}
                    >

                    <View style={{flex:1, marginRight:8}}>

                    <Text
                    style={{
                    fontSize:14,
                    color:"#666",
                    marginBottom:6,
                    }}
                    >
                    Price per kg
                    </Text>

                    <TextInput
                        value={item.price}
                        keyboardType="numeric"
                        onChangeText={(text)=>{
                        setItems(prev =>
                        prev.map(i =>
                        i.id===item.id
                        ? {...i, price:text}
                        : i
                        ))
                        }}
                        style={{
                        borderWidth:1,
                        borderColor:"#DDD",
                        borderRadius:8,
                        padding:10,
                        }}
                    />

                    </View>

                    <View style={{flex:1}}>

                    <Text
                    style={{
                    fontSize:14,
                    color:"#666",
                    marginBottom:6,
                    }}
                    >
                    Total Quantity
                    </Text>

                    <TextInput
                        value={item.quantity}
                        keyboardType="numeric"
                        onChangeText={(text)=>{
                        setItems(prev =>
                        prev.map(i =>
                        i.id===item.id
                        ? {...i, quantity:text}
                        : i
                        ))
                        }}
                        style={{
                        borderWidth:1,
                        borderColor:"#DDD",
                        borderRadius:8,
                        padding:10,
                        }}
                    />

                    </View>

                    </View>

                    </View>

                    )}

                </View>

                <Text
                    style={{
                    fontSize:18,
                    fontWeight:"700",
                    }}
                    >
                    ₹{Number(item.price) * Number(item.quantity)}
                </Text>
                </View>

                </View>
                ))}
            </View>

            {/* GAP */}

            <View style={{ height: 16 }} />

            {/* Supplier Note */}

            <View>
            <Text
                style={{
                fontSize: 16,
                color: "#555",
                marginBottom: 10,
                }}
            >
                Supplier Note (Optional)
            </Text>

            <View
                style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                padding: 16,
                }}
            >
                <TextInput
                    placeholder="Add any adjustments or quality notes here..."
                    multiline
                    returnKeyType="done"
                    style={{
                        backgroundColor:"#FFF",
                        borderRadius:16,
                        padding:16,
                    }}
                    />
            </View>
            </View>

            {/* GAP */}

            </View>

            </ScrollView>

            <View
                style={{
                    backgroundColor: "#FFFFFF",

                    paddingHorizontal: 18,
                    paddingTop: 20,
                    paddingBottom: 20,

                    borderTopWidth: 1,
                    borderTopColor: "#E5E7EB",
                }}
                >

            {/* Info */}

            {hasEditedOrder && !showEditedOrder ? (

            <View
            style={{
            flexDirection:"row",
            alignItems:"flex-start",
            marginBottom:20,
            }}
            >
            <Feather
            name="info"
            size={16}
            color="#F59E0B"
            style={{marginTop:2}}
            />

            <Text
            style={{
            flexShrink: 1,
            maxWidth: "82%",
            marginLeft:8,
            color:"#6B7280",
            fontSize:13,
            lineHeight:20,
            }}
            >
            Old order cannot be confirmed once edited. Switch to Edited Order to proceed.
            </Text>

            </View>

            ) : (

            <View
            style={{
            flexDirection:"row",
            alignItems:"flex-start",
            marginBottom:20,
            }}
            >
            <Feather
            name="info"
            size={16}
            color="#22C55E"
            style={{marginTop:2}}
            />

            <Text
            style={{
            marginLeft:8,
            maxWidth:"82%",
            fontSize:14,
            lineHeight:22,
            color:"#556B56",
            fontWeight:"400",
            }}
            >
            You'll be able to download and share the invoice once the order has been delivered.
            </Text>

            </View>

            )}

            {/* GAP */}

           {!isEditing ? (

            <>
            {/* Buttons Row */}
            

            <TouchableOpacity
                disabled={disableActions}
                onPress={handleFulfillOrder}
                style={{
                    backgroundColor: !disableActions ? "#2E7D32" : "#D1D5DB",
                    borderRadius: 12,
                    paddingVertical: 16,
                    alignItems: "center",
                }}
            >
                <Text
                    style={{
                        color: "#FFFFFF",
                        fontSize: 18,
                        fontWeight: "600",
                    }}
                >
                    Fulfill Order
                </Text>
            </TouchableOpacity>

            <View style={{height:14}} />

            <TouchableOpacity
            disabled={disableActions}
            style={{
            backgroundColor:
            !disableActions
                ? "#E8F5E9"
                : "#F3F4F6",
            borderRadius:12,
            paddingVertical:18,
            alignItems:"center",
            }}
            >
            <Text
            style={{
            color:
            !disableActions
                ? "#1F7A34"
                : "#9CA3AF",
            fontWeight:"600",
            fontSize:17,
            }}
            >
            Fulfill Order & Reschedule delivery
            </Text>
            </TouchableOpacity>

            </>

            ) : (

            <View>

            <View
            style={{
            flexDirection:"row",
            justifyContent:"space-between",
            }}
            >

            <TouchableOpacity
            onPress={()=>{
                setHasEditedOrder(true);
                setShowEditedOrder(true);
                setIsEditing(false);
            }}
            style={{
            flex:1,
            backgroundColor:"#1F7A34",
            borderRadius:12,
            paddingVertical:16,
            alignItems:"center",
            marginRight:8,
            }}
            >
            <Text
            style={{
            color:"#FFF",
            fontWeight:"600",
            fontSize:16,
            }}
            >
            Confirm Changes
            </Text>
            </TouchableOpacity>

            <TouchableOpacity
            onPress={() => {
                setItems(
                    originalItems.map(item => ({ ...item }))
                );
                setIsEditing(false);
            }}
            style={{
            flex:1,
            backgroundColor:"#FBEAEA",
            borderRadius:12,
            paddingVertical:16,
            alignItems:"center",
            marginLeft:8,
            }}
            >
            <Text
            style={{
            color:"#C24141",
            fontWeight:"600",
            fontSize:16,
            }}
            >
            Cancel Editing
            </Text>
            </TouchableOpacity>

            </View>

            </View>

            )}

            

        </View>
    </SafeAreaView>
    </KeyboardAvoidingView>

  );
}
