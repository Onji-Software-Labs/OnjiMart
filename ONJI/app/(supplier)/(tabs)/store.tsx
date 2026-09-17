// import React from 'react';
// import { View, Text, FlatList, Image, TouchableOpacity, ScrollView } from 'react-native';
// import { Ionicons, Feather } from '@expo/vector-icons';

// // Mock data for your store items
// const PRODUCTS = [
//   { id: '1', name: 'Fresh Carrots', price: '2.50', unit: 'kg', stock: 45, image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=200&auto=format&fit=crop' },
//   { id: '2', name: 'Organic Tomatoes', price: '3.20', unit: 'kg', stock: 12, image: 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?q=80&w=200&auto=format&fit=crop' },
//   { id: '3', name: 'Green Bell Pepper', price: '1.80', unit: 'pc', stock: 88, image: 'https://images.unsplash.com/photo-1563565312879-c2753297bc58?q=80&w=200&auto=format&fit=crop' },
//   { id: '4', name: 'Red Onions', price: '4.00', unit: 'kg', stock: 0, image: 'https://images.unsplash.com/photo-1508747703725-719777637510?q=80&w=200&auto=format&fit=crop' },
// ];

// export default function StoreScreen() {
//   return (
//     <View className="flex-1 bg-white pt-12">
//       {/* Header Section */}
//       <View className="px-5 flex-row justify-between items-center mb-6">
//         <View>
//           <Text className="text-2xl font-bold text-gray-900">Your Store</Text>
//           <Text className="text-gray-500">Manage your product catalog</Text>
//         </View>
//         <TouchableOpacity className="bg-[#2E7D32] p-2 rounded-full">
//           <Ionicons name="add" size={24} color="white" />
//         </TouchableOpacity>
//       </View>

//       {/* Filter Chips */}
//       <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5 mb-6 max-h-10">
//         {['All Items', 'In Stock', 'Out of Stock', 'Vegetables', 'Fruits'].map((chip, i) => (
//           <TouchableOpacity 
//             key={chip} 
//             className={`mr-3 px-4 py-2 rounded-full border ${i === 0 ? 'bg-[#E8F5E9] border-[#2E7D32]' : 'bg-white border-gray-200'}`}
//           >
//             <Text className={i === 0 ? 'text-[#2E7D32] font-semibold' : 'text-gray-600'}>{chip}</Text>
//           </TouchableOpacity>
//         ))}
//       </ScrollView>

//       {/* Product List */}
//       <FlatList
//         data={PRODUCTS}
//         keyExtractor={(item) => item.id}
//         contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
//         renderItem={({ item }) => (
//           <View className="flex-row items-center bg-gray-50 p-3 rounded-2xl mb-4 border border-gray-100">
//             <Image 
//               source={{ uri: item.image }} 
//               className="w-20 h-20 rounded-xl bg-gray-200" 
//             />
            
//             <View className="flex-1 ml-4">
//               <Text className="text-lg font-semibold text-gray-800">{item.name}</Text>
//               <Text className="text-gray-500">{item.price} / {item.unit}</Text>
              
//               <View className="flex-row items-center mt-2">
//                 <View className={`h-2 w-2 rounded-full mr-2 ${item.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
//                 <Text className="text-xs text-gray-600">
//                   {item.stock > 0 ? `${item.stock} units available` : 'Out of stock'}
//                 </Text>
//               </View>
//             </View>

//             <TouchableOpacity className="p-2">
//               <Feather name="edit-2" size={18} color="#6B7280" />
//             </TouchableOpacity>
//           </View>
//         )}
//       />
//     </View>
//   );
// }

import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather, MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface Category {
  id: string;
  name: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  imageUri: string;
  updatedYesterday?: boolean;
}

// ─────────────────────────────────────────────────────────────
// MOCK DATA — replace with your real API data
// ─────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  { id: "masalas", name: "Masalas", icon: "chili-mild" },
  { id: "vegetable", name: "Vegetable", icon: "carrot" },
  { id: "fruits", name: "Fruits", icon: "food-apple" },
];

const PRODUCTS_BY_CATEGORY: Record<string, Product[]> = {
  masalas: [
    { id: "1", name: "ONION", price: 28, unit: "kg", imageUri: "https://imgs.search.brave.com/ENesgBm4HgPzTeWESkEawfzYtU5NNzAb1hNyUxealTM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wNjgv/ODk1LzY1NC9zbWFs/bC9hLXJlZC1vbmlv/bi1vbi1hLXdoaXRl/LWJhY2tncm91bmQt/c2hvd2luZy1hLWxh/eWVyZWQtc3RydWN0/dXJlLWFuZC1kcnkt/cm9vdHMtYS1ncmVh/dC1pbWFnZS1mb3It/Y3VsaW5hcnktZHJh/aW5zLWFuZC1zdGls/bC1saWZlcy1waG90/by5qcGVn", updatedYesterday: true },
    { id: "2", name: "TOMATO", price: 28, unit: "kg", imageUri: "https://imgs.search.brave.com/unvg6hshZeM9QgQt-FqhHreJtvAKjqrdIlsQOqN1pB4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzdiLzA1/L2QyLzdiMDVkMjgx/NmUyYzA4MTFlNWNi/NDQwMDAyOWVmMGQ0/LmpwZw", updatedYesterday: true },
    { id: "3", name: "BANANA", price: 28, unit: "kg", imageUri: "https://imgs.search.brave.com/GGI8xXzKP3Qidrc03geJS6JdBuMt2pBmNgPg751udd0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTM1/ODI1NzI5MC9waG90/by9iYW5hbmEuanBn/P3M9NjEyeDYxMiZ3/PTAmaz0yMCZjPS1O/RnoxN2ZMalJtYUdX/SHREUXNZaW91RTRf/YUJfMjFqbDVPU0t0/N1FRa0U9", updatedYesterday: true },
  ],
  vegetable: [],
  fruits: [],
};

const STORE_INFO = {
  name: "Sunways trading",
  ownerName: "Aslam",
  category: "Category: Fruits",
  verifiedYears: "Verified user: 3 years",
  gst: "GST 06BFMPP4123A2ZM",
  address: "Ambalpady, ushqf",
  deliveryDistance: "Delivery: 2-3 Days",
  rating: 4.6,
  avatarUri: "https://i.pravatar.cc/150?img=12",
};

// ─────────────────────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────────────────────

export default function StoreManagementScreen() {
  const [activeTab, setActiveTab] = useState<"listing" | "ratings">("listing");
  const [activeCategory, setActiveCategory] = useState<string>("masalas");
  const [storeActive, setStoreActive] = useState(true);
  const [productListingOn, setProductListingOn] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // ── Selection / edit mode for bulk delete ──
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const isSelecting = selectedIds.size > 0;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const cancelSelection = () => setSelectedIds(new Set());

  const deleteSelected = () => {
    // TODO: call your delete API here with Array.from(selectedIds)
    console.log("Deleting products:", Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const products = PRODUCTS_BY_CATEGORY[activeCategory] ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ── HEADER ── */}
       
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#2E7D32" />
        </TouchableOpacity>
        {/* <Text style={styles.headerTitle}>Business Information</Text> */}
        <View style={{ width: 34 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* ── STORE INFO CARD ── */}
         <View style={styles.topSection}>
            <Text style={styles.sectionTitle}>Business Information</Text>
        <View style={styles.storeCard}>
          <TouchableOpacity style={styles.editLink}>
            <Text style={styles.editLinkText}>Edit</Text>
          </TouchableOpacity>

          <View style={styles.storeCardTop}>
            <Image source={{ uri: STORE_INFO.avatarUri }} style={styles.storeAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.storeName}>{STORE_INFO.name}</Text>
              <Text style={styles.storeSub}>{STORE_INFO.ownerName}</Text>
              <Text style={styles.storeMeta}>{STORE_INFO.category}</Text>
              <View style={styles.verifiedRow}>
                <MaterialCommunityIcons name="check-decagram" size={13} color="#2E7D32" />
                <Text style={styles.storeMeta}>{STORE_INFO.verifiedYears}</Text>
              </View>
              <Text style={styles.storeMeta}>{STORE_INFO.gst}</Text>
               <View style={styles.storeCardActions}>

              <View style={styles.verifiedRow}>
                <Ionicons name="location-outline" size={13} color="#6B7280" />
                <Text style={styles.storeMeta}>{STORE_INFO.address}</Text>
              </View>           
              <View style={styles.ratingBadge}>
                <FontAwesome name="star" size={12} color="#43A047" />
                <Text style={styles.ratingText}>4.5 (6)</Text>
              </View>
              </View>
            </View>
          </View>

          <View style={styles.storeCardBottom}>
              <View style={styles.deliverySection}>
                <View style={styles.deliveryRow}>
                  <MaterialCommunityIcons name="cube-outline" size={14} color="#666" />
                  <Text style={styles.deliveryText}>Delivery: 2-3 days</Text>
                </View>
                <View style={styles.deliveryRow}>
                  <MaterialCommunityIcons name="calendar-outline" size={14} color="#666" />
                  <Text style={styles.deliveryText}>12/04/25</Text>
                </View>
                </View>
                <View style={styles.storeCardActions}>
      
              <TouchableOpacity style={styles.callBtn}>
                <Ionicons name="call" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
     </View>
        {/* ── STORE SELECTOR ── */}
        <View style={styles.storeSelectorRow}>
          <Text style={styles.storeSelectorText}>
            Store: <Text style={styles.storeSelectorBold}>North west, kanye west, ambalpady</Text>
          </Text>
          <TouchableOpacity>
            <Text style={styles.changeLink}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* ── STORE ACTIVITY TOGGLE ── */}
        <View style={styles.activityRow}>
          <Text style={styles.activityLabel}>Store Activity</Text>
          <View style={styles.activityRight}>
            <Text style={[styles.activityStatus, { color: storeActive ? "#2E7D32" : "#9CA3AF" }]}>
              {storeActive ? "Active" : "Inactive"}
            </Text>
            <Switch
              value={storeActive}
              onValueChange={setStoreActive}
              trackColor={{ false: "#E5E7EB", true: "#A7D9B5" }}
              thumbColor={storeActive ? "#2E7D32" : "#fff"}
            />
          </View>
        </View>

        {/* ── PRODUCT LISTING TOGGLE ROW ── */}
        <View style={styles.activityRow}>
          <Text style={styles.activityLabel}>Product listing</Text>
          <Switch
            value={productListingOn}
            onValueChange={setProductListingOn}
            trackColor={{ false: "#E5E7EB", true: "#A7D9B5" }}
            thumbColor={productListingOn ? "#2E7D32" : "#fff"}
          />
        </View>

        {/* ── TABS: PRODUCT LISTING / RATINGS ── */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            onPress={() => setActiveTab("listing")}
            style={[styles.tabBtn, activeTab === "listing" && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, activeTab === "listing" && styles.tabTextActive]}>
              Product listing
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("ratings")}
            style={[styles.tabBtn, activeTab === "ratings" && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, activeTab === "ratings" && styles.tabTextActive]}>
              Ratings
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "listing" ? (
          <View style={styles.listingLayout}>
            {/* ── CATEGORY SIDEBAR — hidden when sidebarVisible is false ── */}
            {sidebarVisible && (
              <View style={styles.categorySidebar}>
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setActiveCategory(cat.id)}
                      style={[styles.categoryItem, isActive && styles.categoryItemActive]}
                    >
                      <MaterialCommunityIcons
                        name={cat.icon}
                        size={22}
                        color={isActive ? "#2E7D32" : "#9CA3AF"}
                      />
                      <Text
                        style={[
                          styles.categoryItemText,
                          isActive && styles.categoryItemTextActive,
                        ]}
                        numberOfLines={1}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity style={styles.addCategoryBtn}>
                  <Feather name="plus" size={18} color="#2E7D32" />
                </TouchableOpacity>
              </View>
            )}

            {/* ── PRODUCTS PANEL ── */}
            <View style={styles.productsPanel}>
              <View style={styles.productsPanelHeader}>
                <View style={styles.sectionTitleRow}>
                  {/* Tapping this chevron toggles the category sidebar */}
                  <TouchableOpacity
                    onPress={() => setSidebarVisible((prev) => !prev)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Feather
                      name={sidebarVisible ? "chevron-left" : "chevron-right"}
                      size={18}
                      color="#111827"
                    />
                  </TouchableOpacity>
                  <Text style={styles.sectionTitle}>
                    {CATEGORIES.find((c) => c.id === activeCategory)?.name}
                  </Text>
                </View>
                <TouchableOpacity>
                  <Feather name="more-vertical" size={18} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.addNewItemPill}>
                <Feather name="plus-circle" size={14} color="#2E7D32" />
                <Text style={styles.addNewItemText}>Add new item</Text>
              </TouchableOpacity>

              <View style={styles.productsGrid}>
                {products.map((product) => {
                  const isSelected = selectedIds.has(product.id);
                  return (
                    <TouchableOpacity
                      key={product.id}
                      activeOpacity={0.85}
                      onLongPress={() => toggleSelect(product.id)}
                      onPress={() => (isSelecting ? toggleSelect(product.id) : undefined)}
                      style={[styles.productCard, isSelected && styles.productCardSelected]}
                    >
                      {isSelecting && (
                        <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                          {isSelected && <Feather name="check" size={12} color="#fff" />}
                        </View>
                      )}
                      <Image source={{ uri: product.imageUri }} style={styles.productImage} />
                      {product.updatedYesterday && (
                        <Text style={styles.productUpdatedText}>Price as of yesterday</Text>
                      )}
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.productPrice}>
                        ₹{product.price}/{product.unit}
                      </Text>
                      <TouchableOpacity style={styles.editItemBtn}>
                        <Text style={styles.editItemText}>Edit</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.ratingsEmpty}>
            <MaterialCommunityIcons name="star-outline" size={48} color="#D1D5DB" />
            <Text style={styles.ratingsEmptyText}>No ratings yet</Text>
          </View>
        )}
      </ScrollView>
 

      {/* ── BOTTOM SELECTION BAR ── */}
      {isSelecting && (
        <View style={styles.selectionBar}>
          <TouchableOpacity style={styles.cancelBtn} onPress={cancelSelection}>
            <Text style={styles.cancelBtnText}>CANCEL</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={deleteSelected}>
            <Text style={styles.deleteBtnText}>
              Delete {selectedIds.size} item{selectedIds.size > 1 ? "s" : ""}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────

const GREEN = "#2E7D32";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: { width: 32, height: 28, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },

  scroll: { padding: 13, paddingBottom: 140 ,backgroundColor: "#ffffff"},

  // ── Store info card ──
  storeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    width: "90%",
    alignSelf: "center",
    marginTop: 10,
  },
  editLink: { position: "absolute", top: 14, right: 16 },
  editLinkText: { color: GREEN, fontWeight: "700", fontSize: 12 },
  storeCardTop: { flexDirection: "row", gap: 12 },
  storeAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#ddd" },
  storeName: { fontSize: 16, fontWeight: "400", color: "#000000" },
  storeSub: { fontSize: 10, color: "#535759", marginBottom: 2 },
  storeMeta: { fontSize: 10, color: "#535759", marginTop: 1 },
  verifiedRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 1 },
  storeCardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,

  },
  deliveryText: { fontSize: 10, color: "#535759", fontWeight: "500" },
  storeCardActions: { flexDirection: "row", alignItems: "center", gap: 100 },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
    ratingBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  alignSelf: 'flex-start',   // ✅ pill only wraps its own content, doesn't stretch
  backgroundColor: '#E6F4EA',
  borderRadius: 6,
  paddingHorizontal: 8,
  paddingVertical: 3,
},
  ratingRow: { flexDirection: "row", alignItems: "center" },
  ratingText: { fontSize: 10, color: "#43A047", fontWeight: "500" },
  // ratingText: { fontSize: 12, fontWeight: "700", color: "#111827" },
  callBtn: {
    width: 108,
    height: 32,
    borderColor: "#204724",
    borderWidth: 0.2,
    borderRadius: 6,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Store selector ──
  storeSelectorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  storeSelectorText: { fontSize: 12.5, color: "#374151", flex: 1 },
  storeSelectorBold: { fontWeight: "700", color: "#111827" },
  changeLink: { fontSize: 12.5, color: GREEN, fontWeight: "700" },

  // ── Activity rows ──
  activityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  activityLabel: { fontSize: 13.5, fontWeight: "600", color: "#111827" },
  activityRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  activityStatus: { fontSize: 12, fontWeight: "700" },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
    deliverySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  // ── Tabs ──
  tabsRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: "center" },
  tabBtnActive: { backgroundColor: "#EAF4EC" },
  tabText: { fontSize: 13, fontWeight: "600", color: "#6B7280" },
  tabTextActive: { color: GREEN },

  // ── Listing layout: sidebar + grid ──
  listingLayout: { flexDirection: "row", gap: 10 },

  categorySidebar: {
    width: 68,
    gap: 8,
  },
  categoryItem: {
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  categoryItemActive: { backgroundColor: "#EAF4EC", borderColor: GREEN },
  categoryItemText: { fontSize: 10, color: "#9CA3AF", marginTop: 4 },
  categoryItemTextActive: { color: GREEN, fontWeight: "700" },
  addCategoryBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderStyle: "dashed",
  },

  productsPanel: { flex: 1 },
  productsPanelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  sectionTitle: { fontFamily: "AlbertSans", fontSize: 12, fontWeight: "600", color: "#535759",paddingLeft: 16, paddingBottom: 2,paddingTop: 3, borderRadius: 8, width: "100%" },

  addNewItemPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "#EAF4EC",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  addNewItemText: { fontSize: 12, fontWeight: "600", color: GREEN },

  productsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  productCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  productCardSelected: { borderColor: GREEN, backgroundColor: "#F3FBF5" },
  checkbox: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
    zIndex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: GREEN, borderColor: GREEN },
  productImage: { width: "100%", height: 70, borderRadius: 10, marginBottom: 6 },
  productUpdatedText: { fontSize: 9, color: "#EF4444", marginBottom: 2 },
  productName: { fontSize: 12, fontWeight: "700", color: "#111827" },
  productPrice: { fontSize: 11, color: "#6B7280", marginTop: 1, marginBottom: 6 },
  editItemBtn: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: GREEN,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  editItemText: { fontSize: 11, color: GREEN, fontWeight: "600" },

  // ── Ratings empty state ──
  ratingsEmpty: { alignItems: "center", paddingVertical: 60 },
  ratingsEmptyText: { color: "#9CA3AF", marginTop: 10, fontSize: 14 },
  topSection: {
    backgroundColor: "#FCF5FF",
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    width: "100%",
  },
  // ── Bottom selection bar ──
  selectionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 12,
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  cancelBtnText: { color: "#374151", fontWeight: "700", fontSize: 13 },
  deleteBtn: {
    flex: 1.4,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: GREEN,
  },
  deleteBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});