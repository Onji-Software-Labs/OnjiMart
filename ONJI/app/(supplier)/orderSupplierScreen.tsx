import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import VegetablesImg from "../../assets/images/Vegetables.png";
import FruitsImg from "../../assets/images/Fruits.png";
import LeafyImg from "../../assets/images/Leafy.png";
import PersonImg from "../../assets/images/Person.png";
import OnionImg from "../../assets/images/Onion.png";
import TomatoImg from "../../assets/images/tomato.png";

const days = [
  { day: "Sun", date: "Mar 24", available: true },
  { day: "Mon", date: "Mar 25", available: true },
  { day: "Tue", date: "Mar 26", available: true },
  { day: "Wed", date: "Mar 25", available: false },
  { day: "Thu", date: "Mar 27", available: true },
  { day: "Fri", date: "Mar 28", available: true },
  { day: "Sat", date: "Mar 29", available: false },
];

const timeSlots = [
  { label: "Morning", time: "7 am – 12 pm", available: true },
  { label: "Morning", time: "12pm – 3pm", available: false },
  { label: "Evening", time: "3pm – 7pm", available: true },
];

const categories = [
  { label: "Vegetables", img: VegetablesImg },
  { label: "Fruits", img: FruitsImg },
  { label: "Leafy", img: LeafyImg },
];

const products = [
  { id: 1, name: "ONION", price: 28, image: OnionImg },
  { id: 2, name: "TOMATO", price: 28, image: TomatoImg },
];

export default function OrderSupplierScreen() {
  const router = useRouter();
  const [expanded, setExpanded] = useState(true);
  const [selectedDay, setSelectedDay] = useState("Thu");
  const [selectedTime, setSelectedTime] = useState("Morning0");
  const [activeCategory, setActiveCategory] = useState("Vegetables");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [customKg, setCustomKg] = useState<Record<number, string>>({});
  const [savedItems, setSavedItems] = useState<number[]>([]);
  const [showSheet, setShowSheet] = useState(false);

  const add = (id: number) =>
    setCart((p) => ({ ...p, [id]: (p[id] || 0) + 1 }));

  const remove = (id: number) =>
    setCart((p) => {
      if (!p[id]) return p;
      if (p[id] === 1) {
        const c = { ...p };
        delete c[id];
        return c;
      }
      return { ...p, [id]: p[id] - 1 };
    });

  const deleteItem = (id: number) =>
    setCart((p) => {
      const c = { ...p };
      delete c[id];
      return c;
    });

  const toggleSave = (id: number) =>
    setSavedItems((p) =>
      p.includes(id) ? p.filter((i) => i !== id) : [...p, id]
    );

  const cartItems = products.filter((p) => cart[p.id]);

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* BACK ARROW */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#2E7D32" />
        </TouchableOpacity>

        {/* BUSINESS INFORMATION */}
        <Text style={styles.sectionLabel}>Business Information</Text>
        <View style={styles.outerCard}>
          <View style={styles.innerCard}>
            <View style={styles.imageWrapper}>
              <Image source={PersonImg} style={styles.avatar} />
              <View style={styles.badge}>
                <Ionicons name="people" size={10} color="#fff" />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.businessName}>Sunways trading</Text>
              <Text style={styles.personName}>Aslam</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={12} color="#2E7D32" />
                <Text style={styles.locationText}>Ambalpady, udupi</Text>
              </View>
            </View>
            <View style={styles.rightCol}>
              <TouchableOpacity onPress={() => setExpanded(!expanded)}>
                <Ionicons
                  name={expanded ? "chevron-down" : "chevron-forward"}
                  size={18}
                  color="#2E7D32"
                />
              </TouchableOpacity>
              <View style={styles.ratingRow}>
                <FontAwesome name="star" size={12} color="#2E7D32" />
                <Text style={styles.ratingText}>4.5(6)</Text>
              </View>
            </View>
          </View>

          {expanded && (
            <View style={styles.deliverySection}>
              <View>
                <View style={styles.deliveryRow}>
                  <MaterialCommunityIcons name="cube-outline" size={14} color="#666" />
                  <Text style={styles.deliveryText}>Delivery: 2-3 days</Text>
                </View>
                <View style={styles.deliveryRow}>
                  <MaterialCommunityIcons name="calendar-outline" size={14} color="#666" />
                  <Text style={styles.deliveryText}>12/04/25</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.callBtn}>
                <Ionicons name="call" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* DELIVER TO */}
        <View style={styles.deliverToRow}>
          <Text style={styles.deliverToText}>
            Deliver to:{" "}
            <Text style={styles.deliverToBold}>
              North west, kanye west, ambalpady
            </Text>
          </Text>
          <TouchableOpacity>
            <Text style={styles.changeLink}>Change</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* SCHEDULE DELIVERY */}
        <Text style={styles.subtitle}>Schedule delivery</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {days.map((item) => (
            <TouchableOpacity
              key={item.day}
              disabled={!item.available}
              onPress={() => setSelectedDay(item.day)}
              style={[
                styles.dayBox,
                selectedDay === item.day && styles.dayBoxActive,
                !item.available && styles.dayBoxDisabled,
              ]}
            >
              {selectedDay === item.day && (
                <View style={styles.dotIndicator} />
              )}
              <Text style={[
                styles.dayText,
                selectedDay === item.day && styles.dayTextActive,
                !item.available && styles.dayTextDisabled,
              ]}>
                {item.day}
              </Text>
              <Text style={[
                styles.dateText,
                selectedDay === item.day && styles.dayTextActive,
                !item.available && styles.dayTextDisabled,
              ]}>
                {item.date}
              </Text>
              {!item.available && (
                <Text style={styles.unavailableText}>Unavailable</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* TIME SLOTS */}
        <Text style={[styles.subtitle, { marginTop: 16 }]}>
          Select time of the day
        </Text>
        <View style={styles.timeRow}>
          {timeSlots.map((slot, i) => (
            <TouchableOpacity
              key={i}
              disabled={!slot.available}
              onPress={() => setSelectedTime(slot.label + i)}
              style={[
                styles.timeBox,
                selectedTime === slot.label + i && styles.timeBoxActive,
                !slot.available && styles.timeBoxDisabled,
              ]}
            >
              <View style={styles.radioRow}>
                <View style={[
                  styles.radioOuter,
                  selectedTime === slot.label + i && styles.radioOuterActive,
                ]}>
                  {selectedTime === slot.label + i && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <View>
                  <Text style={styles.slotLabel}>{slot.label}</Text>
                  <Text style={styles.slotTime}>{slot.time}</Text>
                  {!slot.available && (
                    <Text style={styles.unavailableText}>Unavailable</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* BROWSE ITEMS */}
        <Text style={styles.subtitle}>Browse Items</Text>
        <View style={styles.categoryRow}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.label}
              onPress={() => setActiveCategory(cat.label)}
              style={styles.categoryItem}
            >
              <Image source={cat.img} style={styles.categoryIcon} />
              <Text style={[
                styles.categoryText,
                activeCategory === cat.label && styles.categoryTextActive,
              ]}>
                {cat.label}
              </Text>
              {activeCategory === cat.label && (
                <View style={styles.categoryUnderline} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* SEARCH + FILTER */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <TextInput
              placeholder='search "apple"'
              style={styles.searchInput}
              placeholderTextColor="#999"
            />
            <Ionicons name="search" size={18} color="#999" />
          </View>
          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <Feather name="filter" size={18} color="#444" />
              <Text style={styles.filterText}>Filter</Text>
            </View>
            <View style={styles.filterItem}>
              <Feather name="arrow-up-down" size={18} color="#444" />
              <Text style={styles.filterText}>Sort</Text>
            </View>
            <View style={styles.filterItem}>
              <Feather name="bookmark" size={18} color="#444" />
              <Text style={styles.filterText}>Saved</Text>
            </View>
          </View>
        </View>

        {/* PRODUCTS GRID */}
        <FlatList
          data={products}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const qty = cart[item.id] || 0;
            return (
              <View style={styles.productCard}>
                <TouchableOpacity
                  style={styles.plusBtn}
                  onPress={() => add(item.id)}
                >
                  <Ionicons name="add-circle-outline" size={22} color="#666" />
                </TouchableOpacity>

                <View style={styles.imgBox}>
                  <Image source={item.image} style={styles.productImg} />
                </View>

                <Text style={styles.minQty}>Min quantity: 40kg</Text>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productSub}>Price as of yesterday: 25/kg</Text>
                <Text style={styles.discount}>5% off</Text>
                <Text style={styles.productPrice}>
                  ₹{item.price}/kg{" "}
                  <Text style={styles.mrp}>MRP ₹28/kg</Text>
                </Text>

                {qty === 0 ? (
                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => add(item.id)}
                  >
                    <Text style={styles.addBtnText}>Add</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.qtyRow}>
                    <TouchableOpacity onPress={() => remove(item.id)}>
                      <Text style={styles.qtyBtn}>—</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{qty} × 20kg</Text>
                    <TouchableOpacity onPress={() => add(item.id)}>
                      <Text style={styles.qtyBtn}>+</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          }}
        />
      </ScrollView>

      {/* CART PREVIEW SHEET */}
      {showSheet && cartItems.length > 0 && (
        <View style={styles.cartSheet}>

          {/* Caret handle at top */}
<View style={styles.caretHandle}>
  <TouchableOpacity
    style={styles.caretBtn}
    onPress={() => setShowSheet(false)}
  >
    <Ionicons name="chevron-up" size={20} color="#fff" />
  </TouchableOpacity>
</View>
          <ScrollView>
            {cartItems.map((item) => {
              const kg = customKg[item.id] || "";
              const totalPrice = kg
                ? (item.price * parseFloat(kg)).toFixed(0)
                : (item.price * (cart[item.id] || 0) * 20).toFixed(0);

              return (
                <View key={item.id} style={styles.cartItemRow}>
                  <View style={styles.cartItemImgBox}>
                    <Image source={item.image} style={styles.cartItemImg} />
                  </View>
                  <View style={styles.cartItemInfo}>
                    <Text style={styles.cartItemName}>{item.name}</Text>
                    <Text style={styles.cartItemPrice}>₹{item.price}/kg</Text>
                  </View>
                  <View style={styles.customKgBox}>
                    <View style={styles.customKgInputRow}>
                      <TextInput
                        style={styles.customKgInput}
                        value={kg}
                        onChangeText={(val) =>
                          setCustomKg((p) => ({ ...p, [item.id]: val }))
                        }
                        placeholder="Custom"
                        placeholderTextColor="#333"
                        keyboardType="numeric"
                      />
                      <Feather name="edit-2" size={12} color="#444" />
                      <Text style={styles.customKgText}> Kg</Text>
                    </View>
                    {kg ? (
                      <Text style={styles.totalPrice}>₹{totalPrice}</Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    style={styles.cartAction}
                    onPress={() => toggleSave(item.id)}
                  >
                    <Feather
                      name="bookmark"
                      size={18}
                      color={savedItems.includes(item.id) ? "#2E7D32" : "#444"}
                    />
                    <Text style={styles.cartActionText}>Save for later</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cartAction}
                    onPress={() => deleteItem(item.id)}
                  >
                    <Feather name="trash-2" size={18} color="#444" />
                    <Text style={styles.cartActionText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* CART BOTTOM BAR */}
      <View style={styles.cartBar}>
        <TouchableOpacity
          style={styles.previewCart}
          onPress={() => setShowSheet(!showSheet)}
        >
          {cartItems.length > 0 ? (
            <View style={styles.thumbsRow}>
              {cartItems.slice(0, 3).map((item, idx) => (
                <Image
                  key={idx}
                  source={item.image}
                  style={[styles.thumbImg, { marginLeft: idx > 0 ? -10 : 0 }]}
                />
              ))}
            </View>
          ) : (
            <Ionicons name="cart-outline" size={24} color="#2E7D32" />
          )}
          <Text style={styles.previewText}>Preview cart</Text>
          <Ionicons
            name={showSheet ? "chevron-up" : "chevron-down"}
            size={18}
            color="#2E7D32"
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.checkoutBtn}>
          <Text style={styles.checkoutText}>Checkout →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "ios" ? 55 : StatusBar.currentHeight,
  },
  scroll: { padding: 16, paddingBottom: 220 },
  backBtn: { marginBottom: 12 },
  sectionLabel: { fontSize: 12, color: "#888", marginBottom: 8 },
  outerCard: {
    backgroundColor: "#F3EEFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0D0F5",
    padding: 16,
    marginBottom: 12,
  },
  innerCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0D0F5",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  imageWrapper: { position: "relative", marginRight: 12 },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  badge: {
    position: "absolute",
    bottom: 0,
    left: 0,
    backgroundColor: "#2E7D32",
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#fff",
  },
  businessName: { fontSize: 16, fontWeight: "bold", color: "#111" },
  personName: { fontSize: 13, color: "#444", marginTop: 2 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 2 },
  locationText: { fontSize: 12, color: "#666" },
  rightCol: { alignItems: "flex-end", gap: 12 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontSize: 13, color: "#2E7D32", fontWeight: "600" },
  deliverySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  deliveryRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 },
  deliveryText: { fontSize: 13, color: "#444" },
  callBtn: {
    backgroundColor: "#2E7D32",
    borderRadius: 10,
    flex: 1,
    marginLeft: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  deliverToRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  deliverToText: { fontSize: 13, color: "#444", flex: 1 },
  deliverToBold: { fontWeight: "600", color: "#111" },
  changeLink: { fontSize: 13, color: "#2E7D32", fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#EEE", marginBottom: 12 },
  subtitle: { fontSize: 14, fontWeight: "600", color: "#111", marginBottom: 12 },
  dayBox: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    minWidth: 60,
  },
  dayBoxActive: { borderColor: "#2E7D32", backgroundColor: "#2E7D32" },
  dayBoxDisabled: { opacity: 0.4 },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
    marginBottom: 2,
  },
  dayText: { fontSize: 12, color: "#444", fontWeight: "500" },
  dayTextActive: { color: "#fff" },
  dayTextDisabled: { color: "#999" },
  dateText: { fontSize: 11, color: "#666", marginTop: 2 },
  unavailableText: { fontSize: 9, color: "#999", marginTop: 2 },
  timeRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  timeBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
  },
  timeBoxActive: { borderColor: "#2E7D32" },
  timeBoxDisabled: { opacity: 0.4 },
  radioRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterActive: { borderColor: "#2E7D32" },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#2E7D32",
  },
  slotLabel: { fontSize: 12, fontWeight: "600", color: "#111" },
  slotTime: { fontSize: 10, color: "#666" },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  categoryItem: { alignItems: "center" },
  categoryIcon: { width: 40, height: 40 },
  categoryText: { fontSize: 13, color: "#777", marginTop: 4 },
  categoryTextActive: { color: "#2E7D32", fontWeight: "600" },
  categoryUnderline: {
    height: 2,
    width: "100%",
    backgroundColor: "#2E7D32",
    marginTop: 4,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: { flex: 1, fontSize: 13, color: "#444" },
  filterRow: { flexDirection: "row", gap: 12 },
  filterItem: { alignItems: "center" },
  filterText: { fontSize: 10, color: "#444", marginTop: 2 },
  productCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 10,
    marginBottom: 12,
  },
  plusBtn: { position: "absolute", top: 8, right: 8, zIndex: 1 },
  imgBox: {
    backgroundColor: "#F0E8FF",
    borderRadius: 10,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  productImg: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  minQty: {
    fontSize: 10,
    color: "#1565C0",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  productName: { fontSize: 13, fontWeight: "700", color: "#111" },
  productSub: { fontSize: 10, color: "#777", marginTop: 2 },
  discount: { fontSize: 10, color: "#1565C0", marginTop: 2 },
  productPrice: { fontSize: 13, fontWeight: "700", marginTop: 2 },
  mrp: {
    fontSize: 11,
    color: "#999",
    textDecorationLine: "line-through",
    fontWeight: "400",
  },
  addBtn: {
    borderWidth: 1,
    borderColor: "#2E7D32",
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: "center",
    marginTop: 8,
  },
  addBtnText: { color: "#2E7D32", fontSize: 13 },
  qtyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#2E7D32",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  qtyBtn: { fontSize: 16, color: "#2E7D32", fontWeight: "700" },
  qtyText: { fontSize: 12, color: "#111" },
  cartSheet: {
    position: "absolute",
    bottom: 90,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: 300,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  caretHandle: {
  alignItems: "center",
  marginBottom: 8,
},
caretBtn: {
  backgroundColor: "#2E7D32",
  borderRadius: 20,
  width: 36,
  height: 36,
  alignItems: "center",
  justifyContent: "center",
},
  cartItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    gap: 8,
  },
  cartItemImgBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2E7D32",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#2E7D32",
  },
  cartItemImg: { width: 36, height: 36, borderRadius: 18 },
  cartItemInfo: { flex: 1 },
  cartItemName: { fontSize: 13, fontWeight: "600", color: "#111" },
  cartItemPrice: { fontSize: 12, color: "#666", marginTop: 2 },
  customKgBox: {
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingBottom: 2,
    minWidth: 80,
  },
  customKgInputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  customKgInput: {
    fontSize: 12,
    color: "#333",
    minWidth: 50,
    textAlign: "center",
    padding: 0,
  },
  customKgText: { fontSize: 12, color: "#333" },
  totalPrice: {
    fontSize: 12,
    color: "#111",
    fontWeight: "600",
    marginTop: 2,
  },
  cartAction: { alignItems: "center", gap: 2 },
  cartActionText: { fontSize: 9, color: "#444" },
  cartBar: {
    position: "absolute",
    bottom: 30,
    left: 16,
    right: 16,
    flexDirection: "row",
    gap: 8,
  },
  previewCart: {
    flex: 1,
    backgroundColor: "#E8F5E9",
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  thumbsRow: { flexDirection: "row" },
  thumbImg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#fff",
  },
  previewText: {
    flex: 1,
    color: "#2E7D32",
    fontWeight: "600",
    fontSize: 13,
  },
  checkoutBtn: {
    flex: 1,
    backgroundColor: "#2E7D32",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  checkoutText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});