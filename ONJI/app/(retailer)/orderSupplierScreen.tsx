import React, { useState, useEffect, useRef, useCallback } from "react";
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
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome, Feather } from "@expo/vector-icons";
import axiosInstance from "../../lib/api/axiosConfig";
import { secureStorage } from "../../lib/secureStorage";
import { localStorage } from "../../lib/localStorage";
import { useLocalSearchParams, useRouter } from "expo-router";

const PersonImg = require("../../assets/images/supplier.jpg");

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


type Product = {
  id: string;
  name: string;
  price: number;
  image: any;
  minOrderQuantity: number;
  unit: string;
  stock: number;
  description: string;
};


export default function OrderSupplierScreen() {
  const router = useRouter();
  const { supplierId, businessId, supplierName } = useLocalSearchParams<{
    supplierId: string;
    businessId: string;
    supplierName: string;
  }>();
  //  UI state 
  const [expanded, setExpanded] = useState(true);
  const [selectedDay, setSelectedDay] = useState("Thu");
  const [selectedTime, setSelectedTime] = useState("Morning0");
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [customKg, setCustomKg] = useState<Record<string, string>>({});
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [showSheet, setShowSheet] = useState(false);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  // API state 
  const [token, setToken] = useState<string | null>(null);
  const [shopId, setShopId] = useState<string>("");

  const [apiCategories, setApiCategories] = useState<any[]>([]);
  const [apiSubcategories, setApiSubcategories] = useState<any[]>([]);
  const [apiProducts, setApiProducts] = useState<any[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [cartProducts, setCartProducts] = useState<any[]>([]);
  //  Refs 
  const cartRef = useRef<Record<string, number>>({});

  const syncQueueRef = useRef<Record<string, { pendingDelta: number; inFlight: boolean }>>({});

  const debounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [showImageViewer, setShowImageViewer] =
    useState(false);
  
  const shopIdRef = useRef<string>("");
  const supplierIdRef = useRef<string>("");
  const cartIdRef = useRef<string | null>(null);
  const tokenRef = useRef<string | null>(null);
  const isLoggedOutRef = useRef<boolean>(false);
  const [cartProductsMap, setCartProductsMap] = useState<
  Record<string, any>
>({});


  useEffect(() => { shopIdRef.current = shopId; }, [shopId]);
  useEffect(() => { supplierIdRef.current = supplierId; }, [supplierId]);
  useEffect(() => { cartIdRef.current = cartId; }, [cartId]);
  useEffect(() => { tokenRef.current = token; }, [token]);

  const getAuthHeader = useCallback(async (): Promise<Record<string, string>> => {
    const tok = await secureStorage.getItem("jwtToken") || await secureStorage.getItem("token");
    tokenRef.current = tok ?? null;
    return tok ? { Authorization: `Bearer ${tok}` } : {};
  }, []);

  const getShopId = useCallback(async (): Promise<string | null> => {
    return await localStorage.getItem("shopId");
  }, []);

  const isSessionValid = useCallback((): boolean => {
    if (isLoggedOutRef.current) {
      console.log(" Skip API: user logged out");
      return false;
    }
    if (!tokenRef.current || !shopIdRef.current || !supplierIdRef.current) {
      console.log(" Skip API: invalid session",
        { token: !!tokenRef.current, shopId: !!shopIdRef.current, supplierId: !!supplierIdRef.current });
      return false;
    }
    return true;
  }, []);

const syncCart = async (productId: string, quantity: number) => {
  // Clear any pending sync for this product
  if (debounceRef.current[productId]) {
    clearTimeout(debounceRef.current[productId]);
  }

  // Wait 800ms after last tap before hitting the API
  debounceRef.current[productId] = setTimeout(async () => {
    if (!isSessionValid()) return;

    try {
      const headers = await getAuthHeader();

      if (!cartIdRef.current) {
        const res = await axiosInstance.post(
          `/api/carts/${shopIdRef.current}/${supplierIdRef.current}/add`,
          null,
          { params: { productId, quantity }, headers }
        );
        const newCartId = res.data?.id;
        if (newCartId) {
          cartIdRef.current = newCartId;
          setCartId(newCartId);
          localStorage.setItem("cartId", newCartId);
        }
      } else {
        if (quantity <= 0) {
          await axiosInstance.delete(`/api/carts/${cartIdRef.current}/remove`, {
            params: { productId },
            headers,
          });
        } else {
          await axiosInstance.put(`/api/carts/${cartIdRef.current}/update`, null, {
            params: { productId, quantity },
            headers,
          });
        }
      }
    } catch (err) {
      console.log("[syncCart error]", err);
    }
  }, 800); // ← 800ms debounce
};

const add = useCallback((product: any): void => {

  if (!isSessionValid()) return;

  const strId = String(product.id);

  const prevQty = cartRef.current[strId] ?? 0;

  const newQty = prevQty + 1;

  // Save full product locally
  setCartProductsMap((prev) => ({
    ...prev,
    [strId]: product,
  }));

  cartRef.current = {
    ...cartRef.current,
    [strId]: newQty,
  };

  setCart({ ...cartRef.current });

  syncCart(strId, newQty);

}, [syncCart, isSessionValid]);

 const remove = useCallback((id: any): void => {
  if (!isSessionValid()) return;

  const strId = String(id);

  const prevQty = cart[strId] ?? 0;

  if (prevQty <= 0) return;

  const newQty = prevQty - 1;

  console.log(`[remove] id=${strId} ${prevQty} → ${newQty}`);

  if (newQty <= 0) {
    const updated = { ...cart };
    delete updated[strId];
    setCart(updated);
  } else {
    setCart((prev) => ({
      ...prev,
      [strId]: newQty,
    }));
  }

  syncCart(strId, newQty);

}, [cart, syncCart, isSessionValid]);

  const deleteItem = useCallback((id: any): void => {
    const strId = String(id);
    const updated = { ...cart };
    delete updated[strId];
    setCart(updated);
  }, []);

  const toggleSave = useCallback((id: any) =>
    setSavedItems((p) => p.includes(id) ? p.filter((i) => i !== id) : [...p, id]),
    []);
  const ensureCartExists = useCallback(async (): Promise<void> => {
  if (!isSessionValid()) return;

  const currentShopId = shopIdRef.current;
  const currentSuppId = supplierIdRef.current;

  try {
    const headers = await getAuthHeader();

    console.log(
      `[ensureCart] GET items for shop=${currentShopId} supp=${currentSuppId}`
    );

    // ALWAYS fetch supplier cart from backend
    const res = await axiosInstance.get(
      `/api/carts/${currentShopId}/${currentSuppId}/items`,
      { headers }
    );

    const cartData = res.data;

    // Restore cartId from backend response
    const newCartId =
      cartData?.id ||
      cartData?.cartId;

    if (newCartId && newCartId !== cartIdRef.current) {
      setCartId(newCartId);

      cartIdRef.current = newCartId;

      await localStorage.setItem(
        "cartId",
        newCartId
      );

      console.log(
        `[ensureCart] cartId restored: ${newCartId}`
      );
    }

    // Support multiple response shapes
    const itemsArray = Array.isArray(cartData)
      ? cartData
      : (cartData?.data ||
         cartData?.items ||
         []);

    if (
      Array.isArray(itemsArray) &&
      itemsArray.length > 0
    ) {

      const hydrated: Record<string, number> = {};

      itemsArray.forEach((p: any) => {

        const pid = String(
          p.productId ||
          p.product?.id ||
          p.id
        );

        hydrated[pid] = p.quantity;
      });

      // Restore quantities
      cartRef.current = hydrated;

      setCart(hydrated);

      // Restore preview cart items
      setCartProducts(itemsArray);

      console.log(
        `[ensureCart] hydrated ${itemsArray.length} items`
      );

    } else {

      // Empty cart
      cartRef.current = {};

      setCart({});

      setCartProducts([]);

      console.log("[ensureCart] empty cart");
    }

  } catch (err: any) {

    const status = err?.response?.status;

    console.log(
      `[ensureCart] GET error status=${status}`
    );

    if (status === 404) {

      console.log(
        "[ensureCart] No cart found for this supplier"
      );

      cartRef.current = {};

      setCart({});

      setCartProducts([]);

      cartIdRef.current = null;

      setCartId(null);

      await localStorage.setItem(
        "cartId",
        ""
      );

    } else {

      console.log(
        `[ensureCart] Unexpected error:`,
        err?.message
      );
    }
  }

}, [
  getAuthHeader,
  isSessionValid
    ]);

  const handleLogout = useCallback(async (): Promise<void> => {
    isLoggedOutRef.current = true;

    await Promise.all([
      secureStorage.setItem("jwtToken", ""),
      secureStorage.setItem("token", ""),
      localStorage.setItem("shopId", ""),
      localStorage.setItem("cartId", ""),
    ]);

    cartRef.current = {};
    cartIdRef.current = null;
    shopIdRef.current = "";
    supplierIdRef.current = "";
    tokenRef.current = null;
    syncQueueRef.current = {};
    Object.values(debounceRef.current).forEach(clearTimeout);
    debounceRef.current = {};

    setToken(null);
    setCart({});
    setCartId(null);
    setShopId("");
    setApiCategories([]);
    setApiSubcategories([]);
    setApiProducts([]);

    console.log("[logout]  Session cleared — navigating to login");
    router.replace("/(auth)/login" as any);
  }, [router]);

  useEffect(() => {
    const initApp = async () => {
      try {
        setIsInitializing(true);
        isLoggedOutRef.current = false;

        const storedToken = await secureStorage.getItem("jwtToken") || await secureStorage.getItem("token");
        if (!storedToken) {
          console.log("[init] No token found — redirecting to login");
          router.replace("/(auth)/login" as any);
          return;
        }
        tokenRef.current = storedToken;
        setToken(storedToken);

        let storedShopId = await getShopId();

        if (!storedShopId) {
          try {
            const headers = await getAuthHeader();
            const rRes = await axiosInstance.get("/api/retailer-business/all", { headers });
            const rData = rRes.data?.data || rRes.data;

            if (Array.isArray(rData) && rData.length > 0) {
              const retailerId = rData[0].retailerId || rData[0].id;
              const createRes = await axiosInstance.post("/api/shops/create", {
                retailerId, name: "My Shop", city: "Bangalore", state: "Karnataka",
                pincode: "560001", country: "India",
                contactNumber: "9999999999", openingHours: ["9AM-9PM"], active: true,
              }, { headers });
              const newShopId = createRes.data?.id;
              if (newShopId) { await localStorage.setItem("shopId", newShopId); storedShopId = newShopId; }
            }
          } catch (e: any) { console.log("ERROR: auto-create shop:", e?.message); }
        }

        if (!storedShopId) throw new Error("shopId unavailable");

        setShopId(storedShopId);
        shopIdRef.current = storedShopId;

        //  FIXED: Restore cartId from storage on init only —
        //   this is purely informational; it won't block Add from working.
        //   The /add endpoint will create or reuse the cart on the backend.
        const storedCartId = await localStorage.getItem("cartId");
        if (storedCartId) {
          setCartId(storedCartId);
          cartIdRef.current = storedCartId;
          console.log(`[init]  cartId restored from storage: ${storedCartId}`);
        }

        const headers = await getAuthHeader();
        const res = await axiosInstance.get("/api/supplier-business/all", { headers });
        const data = res.data?.data || res.data;

        if (Array.isArray(data) && data.length > 0) {
          const first = data[0];
          const sid = String(first.supplierId || first.id || first._id);
          setSupplierId(sid);
          supplierIdRef.current = sid;

          await localStorage.setItem("supplierId", sid);
          await localStorage.setItem("supplierName", first.name ?? "Supplier");

          setSupplier(first);
        }
      } catch (err: any) {
        console.log("ERROR: initApp:", err?.message);
      } finally {
        setIsInitializing(false);
      }
    };
    initApp();
  }, []);

  useEffect(() => {
    if ( !shopIdRef.current || !token) return;
    fetchCategories();
    ensureCartExists();
  }, [supplierId, token]);

  const fetchCategories = async () => {
    try {
      const headers = await getAuthHeader();
      const res = await axiosInstance.get(`/suppliers/${supplierId}/categories`, { headers });
      const data = res.data?.data || res.data;
      if (Array.isArray(data) && data.length > 0) {
        setApiCategories(data);
        setActiveCategory(String(data[0].id || data[0].categoryId || data[0]._id));
      }
    } catch (err: any) {
      console.log("ERROR: fetchCategories:", err?.response?.status, err?.message);
    }
  };

  const fetchProducts = async (subCategoryId: string) => {
    if (!subCategoryId) return;
    try {
      const headers = await getAuthHeader();
      const res = await axiosInstance.get(`/api/products/by-subcategory/${subCategoryId}`, { headers });
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) setApiProducts(data);
    } catch (err: any) {
      console.log("ERROR: fetchProducts:", err?.response?.status, err?.message);
    }
  };

  useEffect(() => {
  if (!activeCategory || !token) return;

  const go = async () => {
    if (!isSessionValid()) return;

    try {
      const headers = await getAuthHeader();

      const res = await axiosInstance.get(
        `/suppliers/${supplierId}/categories/${activeCategory}/subcategories`,
        { headers }
      );

      const data = res.data?.data || res.data;

      setApiSubcategories(data || []);

      if (Array.isArray(data) && data.length > 0) {
        const firstSubId = String(data[0].id || data[0]._id);

        setActiveSubcategory(firstSubId);

        fetchProducts(firstSubId);
      } else {
        setApiProducts([]);
      }
    } catch (err: any) {
      console.log(
        "ERROR: fetchSubcategories:",
        err?.response?.status,
        err?.message
      );
    }
  };

  go();
  }, [supplierId, activeCategory, token]);


  const displayProducts: Product[] = apiProducts.map((p, idx) => ({
  id: String(p.productId || p.id || idx),
  name: p.name || `Product ${idx + 1}`,
  price: p.price ?? 0,
  image: p.imageUrl && p.imageUrl.startsWith('http') 
    ? { uri: p.imageUrl }  // ← accept any http URL, no extension check
    : null, 
  minOrderQuantity: p.minOrderQuantity ?? 1,
  unit: p.quantityType === 'COUNT' ? 'pcs' : 'kg',
  stock: p.stockQuantity ?? 0,
  description: p.description ?? '',
  }));

  const displayCategories = apiCategories.map((apiCat) => ({
  id: String(apiCat.id || apiCat.categoryId || apiCat._id),
  displayName: apiCat.name || apiCat.displayName || "Category",
  img: apiCat.imageUrl && apiCat.imageUrl.startsWith('http')
    ? { uri: apiCat.imageUrl }
    : null, // ← fallback if no image from API
  }));

  // const cartItems = displayProducts.filter((p) => (cart[p.id] || 0) > 0);

  if (isInitializing) {
    return (
      <View style={[styles.safe, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  // UI — layout and styles completely unchanged from original
  
  return (
    <View style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#a92727" />
      
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#2E7D32" />
        </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll}>
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
              <Text style={styles.businessName}>{supplierName|| "Sunways trading"}</Text>
              <Text style={styles.personName}>{supplierName || "Aslam"}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={12} color="#2E7D32" />
                <Text style={styles.locationText}>{supplierName || "Ambalpady, udupi"}</Text>
              </View>
            </View>
            <View style={styles.rightCol}>
              <TouchableOpacity onPress={() => setExpanded(!expanded)}>
                <Ionicons name={expanded ? "chevron-down" : "chevron-forward"} size={18} color="#2E7D32" />
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
              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => supplierName && Linking.openURL(`tel:${supplierName}`)}
              >
                <Ionicons name="call" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.deliverToRow}>
          <Text style={styles.deliverToText}>
            Deliver to:{" "}
            <Text style={styles.deliverToBold}>North west, kanye west, ambalpady</Text>
          </Text>
          <TouchableOpacity><Text style={styles.changeLink}>Change</Text></TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <Text style={styles.subtitle}>Schedule delivery</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {days.map((item) => (
            <TouchableOpacity
              key={item.day}
              disabled={!item.available}
              onPress={() => setSelectedDay(item.day)}
              style={[styles.dayBox, selectedDay === item.day && styles.dayBoxActive, !item.available && styles.dayBoxDisabled]}
            >
              {selectedDay === item.day && <View style={styles.dotIndicator} />}
              <Text style={[styles.dayText, selectedDay === item.day && styles.dayTextActive, !item.available && styles.dayTextDisabled]}>{item.day}</Text>
              <Text style={[styles.dateText, selectedDay === item.day && styles.dayTextActive, !item.available && styles.dayTextDisabled]}>{item.date}</Text>
              {!item.available && <Text style={styles.unavailableText}>Unavailable</Text>}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.subtitle, { marginTop: 16 }]}>Select time of the day</Text>
        <View style={styles.timeRow}>
          {timeSlots.map((slot, i) => (
            <TouchableOpacity
              key={i}
              disabled={!slot.available}
              onPress={() => setSelectedTime(slot.label + i)}
              style={[styles.timeBox, selectedTime === slot.label + i && styles.timeBoxActive, !slot.available && styles.timeBoxDisabled]}
            >
              <View style={styles.radioRow}>
                <View style={[styles.radioOuter, selectedTime === slot.label + i && styles.radioOuterActive]}>
                  {selectedTime === slot.label + i && <View style={styles.radioInner} />}
                </View>
                <View>
                  <Text style={styles.slotLabel}>{slot.label}</Text>
                  <Text style={styles.slotTime}>{slot.time}</Text>
                  {!slot.available && <Text style={styles.unavailableText}>Unavailable</Text>}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.categoryBox}>

      <Text style={styles.sectionTitle}>Browse by Category</Text>
        <View style={styles.categoryRow}>
          {displayCategories.map((cat) => (
            <TouchableOpacity 
  key={cat.id} 
  onPress={() => setActiveCategory(cat.id)} 
  style={styles.categoryItem}
>
  {cat.img && (
    <Image 
      source={cat.img} 
      style={styles.categoryIcon}
    />
  )}
  <Text style={[
    styles.categoryText, 
    activeCategory === cat.id && styles.categoryTextActive
  ]}>
    {cat.displayName}
  </Text>
  {activeCategory === cat.id && <View style={styles.categoryUnderline} />}
</TouchableOpacity>
          ))}
        </View></View>
        <View style={styles.subcategoryBox}>

        <Text style={styles.sectionTitle}>Related Options</Text>
        <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.subcategoryRow}
        >
        {apiSubcategories.map((sub: any) => {
        const subId = String(sub.id || sub._id);

        return (
          <TouchableOpacity
            key={subId}
            onPress={() => {
          setActiveSubcategory(subId);
          fetchProducts(subId);
        }}
        style={[
          styles.subcategoryItem,
          activeSubcategory === subId &&
            styles.subcategoryItemActive,
        ]}
      >
        <Text style={styles.subcategoryText}>
          {sub.name}
        </Text>
      </TouchableOpacity>
    );
  })}
</ScrollView></View>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <TextInput placeholder='search "apple"' style={styles.searchInput} placeholderTextColor="#999" />
            <Ionicons name="search" size={18} color="#999" />
          </View>
          <View style={styles.filterRow}>
            <View style={styles.filterItem}><Feather name="filter" size={18} color="#444" /><Text style={styles.filterText}>Filter</Text></View>
            <View style={styles.filterItem}><Feather name="arrow-down" size={18} color="#444" /><Text style={styles.filterText}>Sort</Text></View>
            <View style={styles.filterItem}><Feather name="bookmark" size={18} color="#444" /><Text style={styles.filterText}>Saved</Text></View>
          </View>
        </View>

<FlatList
  data={displayProducts}
  numColumns={2}
  scrollEnabled={false}
  extraData={cart}
  columnWrapperStyle={{ justifyContent: "space-between" }}
  keyExtractor={(item) => String(item.id)}
  renderItem={({ item }) => {
    const qty = cart[String(item.id)] || 0;


    return (
      <View style={styles.productCard}>

        {/* IMAGE CLICKABLE */}
        <TouchableOpacity
          style={styles.imgBox}
          onPress={() => {
            setSelectedImage(item.image);
            setShowImageViewer(true);
          }}
        >
      <Image
  source={item.image}
  style={styles.productImg}
/>
        </TouchableOpacity>

        <Text style={styles.minQty}>
          Min quantity: {item.minOrderQuantity} {item.unit}
        </Text>

        <Text style={styles.productName}>
          {item.name}
        </Text>

        {item.description ? (
          <Text style={styles.productSub}>
            {item.description}
          </Text>
        ) : null}

        {item.stock === 0 && (
          <Text style={{ color: "red", fontSize: 11 }}>
            Out of stock
          </Text>
        )}

        <Text style={styles.productPrice}>
          ₹{item.price}/{item.unit}
        </Text>

        {qty === 0 ? (

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => add(item)}
          >
            <Text style={styles.addBtnText}>
              Add
            </Text>
          </TouchableOpacity>

        ) : (

          <View style={styles.qtyRow}>

            <TouchableOpacity
              onPress={() => remove(item.id)}
            >
              <Text style={styles.qtyBtn}>
                —
              </Text>
            </TouchableOpacity>

            <Text style={styles.qtyText}>
              {qty} × {item.unit}
            </Text>

            <TouchableOpacity
              onPress={() => add(item)}
            >
              <Text style={styles.qtyBtn}>
                +
              </Text>
            </TouchableOpacity>

          </View>

        )}

      </View>
    );
  }}
/>

{/* FULLSCREEN IMAGE MODAL */}
<Modal
  visible={showImageViewer}
  transparent
  animationType="fade"
>

  <View style={styles.imageModalOverlay}>

    <TouchableOpacity
      style={styles.closeBtn}
      onPress={() => setShowImageViewer(false)}
    >
      <Ionicons
        name="close"
        size={30}
        color="#fff"
      />
    </TouchableOpacity>

    <Image
      source={selectedImage}
      style={styles.fullscreenImage}
      resizeMode="contain"
    />

  </View>

</Modal>
      </ScrollView>

      {showSheet && cartProducts.length > 0 && (
        <View style={styles.cartSheet}>
          <View style={styles.caretHandle}>
            <TouchableOpacity style={styles.caretBtn} onPress={() => setShowSheet(false)}>
              <Ionicons name="chevron-up" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
  <ScrollView>

  {Object.entries(cart).map(([productId, qty]) => {

    const item = cartProductsMap[productId];

    if (!item) return null;

    const kg = customKg[productId] || "";

    const totalPrice = kg
      ? (item.price * parseFloat(kg)).toFixed(0)
      : (
          item.price *
          Number(qty) *
          20
        ).toFixed(0);

    return (

      <View
        key={productId}
        style={styles.cartItemRow}
      >

        <View style={styles.cartItemImgBox}>

         <TouchableOpacity
  onPress={() => {
    setSelectedImage(item.image);
    setShowImageViewer(true);
  }}
>

  <Image
    source={item.image}
    style={styles.cartItemImg}
  />

</TouchableOpacity>

        </View>

        <View style={styles.cartItemInfo}>

          <Text style={styles.cartItemName}>
            {item.name}
          </Text>

          <Text style={styles.cartItemPrice}>
            ₹{item.price}/{item.unit}
          </Text>

        </View>

        <View style={styles.customKgBox}>

          <View style={styles.customKgInputRow}>

            <TextInput
              style={styles.customKgInput}
              value={kg}
              onChangeText={(val) =>
                setCustomKg((p) => ({
                  ...p,
                  [productId]: val,
                }))
              }
              placeholder="Custom"
              placeholderTextColor="#333"
              keyboardType="numeric"
            />

            <Feather
              name="edit-2"
              size={12}
              color="#444"
            />

            <Text style={styles.customKgText}>
              {" "}Kg
            </Text>

          </View>

          {kg ? (
            <Text style={styles.totalPrice}>
              ₹{totalPrice}
            </Text>
          ) : null}

        </View>

        <TouchableOpacity
          style={styles.cartAction}
          onPress={() => toggleSave(productId)}
        >

          <Feather
            name="bookmark"
            size={18}
            color={
              savedItems.includes(productId)
                ? "#2E7D32"
                : "#444"
            }
          />

          <Text style={styles.cartActionText}>
            Save for later
          </Text>

        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cartAction}
          onPress={() => deleteItem(productId)}
        >

          <Feather
            name="trash-2"
            size={18}
            color="#444"
          />

          <Text style={styles.cartActionText}>
            Delete
          </Text>

        </TouchableOpacity>

      </View>
    );

  })}

</ScrollView>
        </View>
      )}

      <View style={styles.cartBar}>
        <TouchableOpacity
          style={styles.previewCart}
          onPress={() => {
            if (Object.values(cartProductsMap).length === 0) {
              Alert.alert("Cart is empty", "Add some products first!");
              return;
            }
            setShowSheet(!showSheet);
          }}>
          {Object.values(cartProductsMap).length > 0 ? (
            <View style={styles.thumbsRow}>
              {Object.values(cartProductsMap).slice(0, 3).map((item, idx) => (
                <Image key={idx} source={item.image} style={[styles.thumbImg, { marginLeft: idx > 0 ? -10 : 0 }]} />
              ))}
            </View>
          ) : (
            <Ionicons name="cart-outline" size={24} color="#2E7D32" />
          )}
          <Text style={styles.previewText}>Preview cart</Text>
          <Ionicons name={showSheet ? "chevron-up" : "chevron-down"} size={18} color="#2E7D32" />
        </TouchableOpacity>
<TouchableOpacity
  style={styles.checkoutBtn}

  onPress={() => {
      console.log('cartId:', cartIdRef.current); // check this in your terminal
  if (!cartIdRef.current) {
    console.log('No cartId yet!');
    return;
  }
    router.push({
      pathname: "/(retailer)/checkout",
      params: {
 cart: JSON.stringify({
        supplierId: supplierId,
        supplierName: supplierName,
        items: cartProducts,        // ← already in your state
      }),      },
    });
  }}
>
<Text style={styles.checkoutText}>Checkout </Text>
          
     </TouchableOpacity>
      </View>
    </View>
  );
}
// ── STYLES COMPLETELY UNCHANGED ────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff", paddingTop: Platform.OS === "ios" ? 55 : StatusBar.currentHeight },
  scroll: { padding: 15, paddingBottom: 220 },
  backBtn: {  paddingHorizontal: 20, paddingVertical: 5, paddingTop: 0, marginTop: -15,  },
  sectionLabel: { fontSize: 12, color: "#888", marginBottom: 8 },
  outerCard: { backgroundColor: "#F3EEFF", borderRadius: 16, borderWidth: 1, borderColor: "#E0D0F5", padding: 16, marginBottom: 12 },
  innerCard: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#E0D0F5", padding: 12, flexDirection: "row", alignItems: "center" },
  imageWrapper: { position: "relative", marginRight: 12 },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  badge: { position: "absolute", bottom: 0, left: 0, backgroundColor: "#2E7D32", borderRadius: 10, width: 18, height: 18, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#fff" },
  businessName: { fontSize: 16, fontWeight: "bold", color: "#111" },
  personName: { fontSize: 13, color: "#444", marginTop: 2 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 2 },
  locationText: { fontSize: 12, color: "#666" },
  rightCol: { alignItems: "flex-end", gap: 12 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontSize: 13, color: "#2E7D32", fontWeight: "600" },
  deliverySection: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16 },
  deliveryRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 },
  deliveryText: { fontSize: 13, color: "#444" },
  callBtn: { backgroundColor: "#2E7D32", borderRadius: 10, flex: 1, marginLeft: 16, paddingVertical: 14, alignItems: "center", justifyContent: "center" },
  deliverToRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
  deliverToText: { fontSize: 13, color: "#444", flex: 1 },
  deliverToBold: { fontWeight: "600", color: "#111" },
  changeLink: { fontSize: 13, color: "#2E7D32", fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#EEE", marginBottom: 12 },
  subtitle: { fontSize: 14, fontWeight: "600", color: "#111", marginBottom: 12 },
  dayBox: { alignItems: "center", paddingVertical: 8, paddingHorizontal: 12, marginRight: 8, borderRadius: 20, borderWidth: 1, borderColor: "#ddd", minWidth: 60 },
  dayBoxActive: { borderColor: "#2E7D32", backgroundColor: "#2E7D32" },
  dayBoxDisabled: { opacity: 0.4 },
  dotIndicator: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#fff", marginBottom: 2 },
  dayText: { fontSize: 12, color: "#444", fontWeight: "500" },
  dayTextActive: { color: "#fff" },
  dayTextDisabled: { color: "#999" },
  dateText: { fontSize: 11, color: "#666", marginTop: 2 },
  unavailableText: { fontSize: 9, color: "#999", marginTop: 2 },
  timeRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  timeBox: { flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 10 },
  timeBoxActive: { borderColor: "#2E7D32" },
  timeBoxDisabled: { opacity: 0.4 },
  radioRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  radioOuter: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: "#ddd", alignItems: "center", justifyContent: "center" },
  radioOuterActive: { borderColor: "#2E7D32" },
  radioInner: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#2E7D32" },
  slotLabel: { fontSize: 12, fontWeight: "600", color: "#111" },
  slotTime: { fontSize: 10, color: "#666" },
  categoryRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 12 },
  categoryItem: { alignItems: "center" },
  categoryIcon: { width: 40, height: 40 },
  categoryText: { fontSize: 13, color: "#777", marginTop: 4 },
  categoryTextActive: { color: "#2E7D32", fontWeight: "600" },
  categoryUnderline: { height: 2, width: "100%", backgroundColor: "#2E7D32", marginTop: 4 },
  searchRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 8 },
  searchBox: { flex: 1, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#ddd", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  searchInput: { flex: 1, fontSize: 13, color: "#444" },
  filterRow: { flexDirection: "row", gap: 12 },
  filterItem: { alignItems: "center" },
  filterText: { fontSize: 10, color: "#444", marginTop: 2 },
  productCard: { width: "48%", backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#eee", padding: 10, marginBottom: 12 },
  plusBtn: { position: "absolute", top: 8, right: 8, zIndex: 1 },
  imgBox: { backgroundColor: "#F0E8FF", borderRadius: 10, height: 120, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  productImg: { width: 100, height: 100, resizeMode: "contain" },
  minQty: { fontSize: 10, color: "#1565C0", backgroundColor: "#E3F2FD", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: "flex-start", marginBottom: 4 },
  productName: { fontSize: 13, fontWeight: "700", color: "#111" },
  productSub: { fontSize: 10, color: "#777", marginTop: 2 },
  discount: { fontSize: 10, color: "#1565C0", marginTop: 2 },
  productPrice: { fontSize: 13, fontWeight: "700", marginTop: 2 },
  mrp: { fontSize: 11, color: "#999", textDecorationLine: "line-through", fontWeight: "400" },
  addBtn: { borderWidth: 1, borderColor: "#2E7D32", borderRadius: 8, paddingVertical: 6, alignItems: "center", marginTop: 8 },
  addBtnText: { color: "#2E7D32", fontSize: 13 },
  qtyRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, borderWidth: 1, borderColor: "#2E7D32", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  qtyBtn: { fontSize: 16, color: "#2E7D32", fontWeight: "700" },
  qtyText: { fontSize: 12, color: "#111" },
  cartSheet: { position: "absolute", bottom: 90, left: 0, right: 0, backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: 300, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, shadowColor: "#000", shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 },
  caretHandle: { alignItems: "center", marginBottom: 8 },
  caretBtn: { backgroundColor: "#2E7D32", borderRadius: 20, width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  cartItemRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F0F0F0", gap: 8 },
  cartItemImgBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#2E7D32", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#2E7D32" },
  cartItemImg: { width: 36, height: 36, borderRadius: 18 },
  cartItemInfo: { flex: 1 },
  cartItemName: { fontSize: 13, fontWeight: "600", color: "#111" },
  cartItemPrice: { fontSize: 12, color: "#666", marginTop: 2 },
  customKgBox: { alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#333", paddingBottom: 2, minWidth: 80 },
  customKgInputRow: { flexDirection: "row", alignItems: "center" },
  customKgInput: { fontSize: 12, color: "#333", minWidth: 50, textAlign: "center", padding: 0 },
  customKgText: { fontSize: 12, color: "#333" },
  totalPrice: { fontSize: 12, color: "#111", fontWeight: "600", marginTop: 2 },
  cartAction: { alignItems: "center", gap: 2 },
  cartActionText: { fontSize: 9, color: "#444" },
  cartBar: { position: "absolute", bottom: 30, left: 16, right: 16, flexDirection: "row", gap: 8 },
  previewCart: { flex: 1, backgroundColor: "#E8F5E9", borderRadius: 30, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  thumbsRow: { flexDirection: "row" },
  thumbImg: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: "#fff" },
  previewText: { flex: 1, color: "#2E7D32", fontWeight: "600", fontSize: 13 },
  checkoutBtn: { flex: 1, backgroundColor: "#2E7D32", borderRadius: 30, alignItems: "center", justifyContent: "center", paddingVertical: 14 },
  checkoutText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  subcategoryRow: {
  flexDirection: 'row',
  marginTop: 12,
  marginBottom: 10,
  flexWrap: 'wrap',
},

subcategoryItem: {
  paddingHorizontal: 14,
  paddingVertical: 8,
  backgroundColor: '#F1F1F1',
  borderRadius: 20,
  marginRight: 10,
  marginBottom: 10,
},

subcategoryItemActive: {
  backgroundColor: '#2E7D32',
  
},

subcategoryText: {
  color: '#000000',
  fontSize: 14,
},
categoryBox: {
  marginTop: 10,
  marginBottom: 15,
},

subcategoryBox: {
  marginBottom: 20,
},

sectionTitle: {
  fontSize: 15,
  fontWeight: '600',
  color: '#111',
  marginBottom: 10,
  letterSpacing: 0.1,
},
imageModalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.95)",
  justifyContent: "center",
  alignItems: "center",
},

closeBtn: {
  position: "absolute",
  top: 50,
  right: 20,
  zIndex: 10,
},

fullscreenImage: {
  width: "90%",
  height: "80%",
},
});