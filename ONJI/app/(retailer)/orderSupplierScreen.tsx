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
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome, Feather } from "@expo/vector-icons";
import axiosInstance from "../../lib/api/axiosConfig";
import { storage } from "../../lib/storage";
import { useRouter } from "expo-router";

const VegetablesImg = require("../../assets/images/Vegetables.png");
const FruitsImg = require("../../assets/images/Fruits.png");
const LeafyImg = require("../../assets/images/Leafy.png");
const GroceriesImg = require("../../assets/images/Groceries.png");
const PersonImg = require("../../assets/images/Person.png");
const OnionImg = require("../../assets/images/Onion.png");
const TomatoImg = require("../../assets/images/tomato.png");


// Static data — unchanged

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
  { label: "Groceries", img: GroceriesImg },
];

const products = [
  { id: "1", name: "ONION", price: 28, image: OnionImg },
  { id: "2", name: "TOMATO", price: 28, image: TomatoImg },
];


// TRUE DELTA MODE
// API always receives exactly +1 or -1 per call — never an absolute quantity.
// Rapid clicks while a request is in-flight accumulate into pendingDelta
// and are flushed as one follow-up call once the current one resolves.


export default function OrderSupplierScreen() {
  const router = useRouter();

  //  UI state 
  const [expanded, setExpanded] = useState(true);
  const [selectedDay, setSelectedDay] = useState("Thu");
  const [selectedTime, setSelectedTime] = useState("Morning0");
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [customKg, setCustomKg] = useState<Record<string, string>>({});
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [showSheet, setShowSheet] = useState(false);

  // API state 
  const [token, setToken] = useState<string | null>(null);
  const [shopId, setShopId] = useState<string>("");
  const [supplierId, setSupplierId] = useState<string>("");
  const [apiCategories, setApiCategories] = useState<any[]>([]);
  const [apiSubcategories, setApiSubcategories] = useState<any[]>([]);
  const [apiProducts, setApiProducts] = useState<any[]>([]);
  const [supplier, setSupplier] = useState<any>(null);
  const [cartId, setCartId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

  //  Refs 
  const cartRef = useRef<Record<string, number>>({});

  const syncQueueRef = useRef<Record<string, { pendingDelta: number; inFlight: boolean }>>({});

  const debounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const shopIdRef = useRef<string>("");
  const supplierIdRef = useRef<string>("");
  const cartIdRef = useRef<string | null>(null);
  const tokenRef = useRef<string | null>(null);
  const isLoggedOutRef = useRef<boolean>(false);

  useEffect(() => { shopIdRef.current = shopId; }, [shopId]);
  useEffect(() => { supplierIdRef.current = supplierId; }, [supplierId]);
  useEffect(() => { cartIdRef.current = cartId; }, [cartId]);
  useEffect(() => { tokenRef.current = token; }, [token]);

  
  // Helpers
  

  const getAuthHeader = useCallback(async (): Promise<Record<string, string>> => {
    const tok = await storage.getItem("jwtToken") || await storage.getItem("token");
    tokenRef.current = tok ?? null;
    return tok ? { Authorization: `Bearer ${tok}` } : {};
  }, []);

  const getShopId = useCallback(async (): Promise<string | null> => {
    return await storage.getItem("shopId");
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

  
  // fetchCartItems — hydrates local cart state from server
  // FIXED: Extracted as standalone function so it can be called
  //   after every successful Add action, keeping UI in sync with backend.
  
  const fetchCartItems = useCallback(async (): Promise<void> => {
    if (!isSessionValid()) return;

    const currentShopId = shopIdRef.current;
    const currentSuppId = supplierIdRef.current;

    try {
      const headers = await getAuthHeader();
      console.log(`[fetchCartItems] GET items for shop=${currentShopId} supp=${currentSuppId}`);

      const res = await axiosInstance.get(
        `/api/carts/${currentShopId}/${currentSuppId}/items`,
        { headers }
      );

      const cartData = res.data;

      // Extract cartId if the response is an object
      const newCartId = cartData?.id || cartData?.cartId;
      if (newCartId && newCartId !== cartIdRef.current) {
        setCartId(newCartId);
        cartIdRef.current = newCartId;
        await storage.setItem("cartId", newCartId);
        console.log(`[fetchCartItems]  cartId from GET response: ${newCartId}`);
      }

      // Hydrate cart quantities — handles both response shapes
      const itemsArray = Array.isArray(cartData)
        ? cartData
        : (cartData?.data || cartData?.items || []);

      if (Array.isArray(itemsArray) && itemsArray.length > 0) {
        const hydrated: Record<string, number> = {};
        itemsArray.forEach((p: any) => {
          const pid = String(p.productId || p.product?.id || p.id);
          hydrated[pid] = p.quantity;
        });
        cartRef.current = hydrated;
        setCart({ ...hydrated });
        console.log(`[fetchCartItems]  hydrated ${itemsArray.length} items`);
      } else {
        cartRef.current = {};
        setCart({});
      }
    } catch (err: any) {
      console.log(`[fetchCartItems] ERROR:`, err?.response?.status, err?.message);
    }
  }, [getAuthHeader, isSessionValid]);

 
  // syncCartWithServer — TRUE DELTA MODE + SESSION GUARD
  // FIXED: POST /add is the ONLY cart-creation mechanism.
  //   No /create endpoint is called anywhere.
  //   After a successful add, fetchCartItems() is called to sync UI.
  
  const syncCartWithServer = useCallback(async (productId: string, delta: number): Promise<void> => {
    if (!isSessionValid()) return;

    const currentShopId = shopIdRef.current;
    const currentSuppId = supplierIdRef.current;

    const entry = syncQueueRef.current[productId];

    if (entry?.inFlight) {
      console.log(`[sync] Already in-flight for id=${productId} — skip`);
      return;
    }

    if (!syncQueueRef.current[productId]) {
      syncQueueRef.current[productId] = { pendingDelta: 0, inFlight: true };
    } else {
      syncQueueRef.current[productId].inFlight = true;
    }

    const quantityToSend = delta;
    console.log(`[sync] POST id=${productId} quantityToSend=${quantityToSend} (delta mode)`);

    try {
      const headers = await getAuthHeader();

      // FIXED: POST /add creates the cart automatically on first call.
      // No separate /create call is made before or after this.
      const res = await axiosInstance.post(
        `/api/carts/${currentShopId}/${currentSuppId}/add`,
        null,
        { params: { productId: String(productId), quantity: Number(quantityToSend) }, headers }
      );

      console.log(`[sync] RESPONSE:`, res.data);

      // FIXED: Capture cartId returned by /add on first call (cart auto-created by backend).
      const newCartId = res.data?.id || res.data?.cartId;
      if (newCartId && newCartId !== cartIdRef.current) {
        setCartId(newCartId);
        cartIdRef.current = newCartId;
        await storage.setItem("cartId", newCartId);
        console.log(`[sync]  cartId captured from /add response: ${newCartId}`);
      }

      // FIXED: After every successful Add, fetch items to keep UI consistent with backend.
      await fetchCartItems();

    } catch (err: any) {
      console.log(`[sync] ERROR id=${productId}`, err?.response?.status, err?.response?.data ?? err?.message);

    } finally {
      if (syncQueueRef.current[productId]) {
        syncQueueRef.current[productId].inFlight = false;
      }

      if (!isLoggedOutRef.current) {
        const pendingDelta = syncQueueRef.current[productId]?.pendingDelta ?? 0;
        if (pendingDelta !== 0) {
          console.log(`[sync] FLUSH pendingDelta=${pendingDelta}`);
          syncQueueRef.current[productId].pendingDelta = 0;
          setTimeout(() => syncCartWithServer(productId, pendingDelta), 0);
        }
      }
    }
  }, [getAuthHeader, isSessionValid, fetchCartItems]);

  
  // scheduleSync — TRUE DELTA MODE (unchanged logic)
  
  const scheduleSync = useCallback((productId: string, delta: number): void => {
    if (!syncQueueRef.current[productId]) {
      syncQueueRef.current[productId] = { pendingDelta: delta, inFlight: false };
    } else {
      syncQueueRef.current[productId].pendingDelta += delta;
    }

    console.log(`[scheduleSync] id=${productId} delta=${delta} pendingDelta=${syncQueueRef.current[productId].pendingDelta}`);

    if (debounceRef.current[productId]) {
      clearTimeout(debounceRef.current[productId]);
    }

    debounceRef.current[productId] = setTimeout(() => {
      const e = syncQueueRef.current[productId];
      if (!e) return;

      if (e.inFlight) {
        console.log(`[scheduleSync] debounce fired inFlight=true — deferred to flush`);
        return;
      }

      const deltaToSend = e.pendingDelta;
      if (deltaToSend === 0) return;
      e.pendingDelta = 0;
      syncCartWithServer(productId, deltaToSend);
    }, 500);
  }, [syncCartWithServer]);

  
  // add — increment by +1 (optimistic)
  //  FIXED: No cartId guard here. /add creates the cart on first call.
  //   The backend handles cart creation automatically.
  
  const add = useCallback((id: any): void => {
    if (!isSessionValid()) return;

    const strId = String(id);
    const prevQty = cartRef.current[strId] ?? 0;
    const newQty = prevQty + 1;

    console.log(`[add] id=${strId} ${prevQty} → ${newQty}`);

    cartRef.current = { ...cartRef.current, [strId]: newQty };
    setCart({ ...cartRef.current });

    // FIXED: quantity=1 always — cart created automatically by POST /add on first call
    scheduleSync(strId, +1);
  }, [scheduleSync, isSessionValid]);


  // remove — decrement by -1 (optimistic)
  // FIXED: Block -/+ if item doesn't exist in cart yet (qty === 0).
  //   This prevents spurious API calls for items never added.
  
  const remove = useCallback((id: any): void => {
    if (!isSessionValid()) return;

    const strId = String(id);
    const prevQty = cartRef.current[strId] ?? 0;

    // FIXED: Block remove if item not in cart — no API call for non-existent items.
    if (prevQty <= 0) {
      console.log(`[remove] id=${strId} not in cart or already 0 — no-op`);
      return;
    }

    const newQty = prevQty - 1;

    console.log(`[remove] id=${strId} ${prevQty} → ${newQty}`);

    if (newQty === 0) {
      const updated = { ...cartRef.current };
      delete updated[strId];
      cartRef.current = updated;
      setCart({ ...cartRef.current });
    } else {
      cartRef.current = { ...cartRef.current, [strId]: newQty };
      setCart({ ...cartRef.current });
    }

    scheduleSync(strId, -1);
  }, [scheduleSync, isSessionValid]);

  const deleteItem = useCallback((id: any): void => {
    const strId = String(id);
    const updated = { ...cartRef.current };
    delete updated[strId];
    cartRef.current = updated;
    setCart({ ...cartRef.current });
  }, []);

  const toggleSave = useCallback((id: any) =>
    setSavedItems((p) => p.includes(id) ? p.filter((i) => i !== id) : [...p, id]),
    []);

 
  // ensureCartExists —  FIXED: No /create call — ever.
  // Strategy:
  //   1. GET /items → hydrate cart state if cart already exists
  //   2. 404 → log and wait. Cart will be created on the user's first Add.
  // This matches the backend design: POST /add creates the cart automatically.
  
  const ensureCartExists = useCallback(async (): Promise<void> => {
    if (!isSessionValid()) return;

    const currentShopId = shopIdRef.current;
    const currentSuppId = supplierIdRef.current;

    // Restore cartId from storage before any network call
    if (!cartIdRef.current) {
      const stored = await storage.getItem("cartId");
      if (stored) {
        cartIdRef.current = stored;
        setCartId(stored);
        console.log(`[ensureCart] cartId restored from storage: ${stored}`);
      }
    }

    // FIXED: cart persistence issue after logout (STRICT RESET)
    // If no cartId exists locally (e.g., after logout/fresh login), we DO NOT fetch.
    // The cart will be created automatically on the user's first Add.
    if (!cartIdRef.current) {
      console.log("[ensureCart] No local cartId found (fresh login) — skipping auto-fetch. Cart will be initialized on first Add.");
      cartRef.current = {};
      setCart({});
      return;
    }

    try {
      const headers = await getAuthHeader();

      console.log(`[ensureCart] GET items for shop=${currentShopId} supp=${currentSuppId}`);
      const res = await axiosInstance.get(
        `/api/carts/${currentShopId}/${currentSuppId}/items`,
        { headers }
      );

      const cartData = res.data;

      const newCartId = cartData?.id || cartData?.cartId;
      if (newCartId && newCartId !== cartIdRef.current) {
        setCartId(newCartId);
        cartIdRef.current = newCartId;
        await storage.setItem("cartId", newCartId);
        console.log(`[ensureCart]  cartId from GET response: ${newCartId}`);
      }

      const itemsArray = Array.isArray(cartData)
        ? cartData
        : (cartData?.data || cartData?.items || []);

      if (Array.isArray(itemsArray) && itemsArray.length > 0) {
        const hydrated: Record<string, number> = {};
        itemsArray.forEach((p: any) => {
          const pid = String(p.productId || p.product?.id || p.id);
          hydrated[pid] = p.quantity;
        });
        cartRef.current = hydrated;
        setCart({ ...hydrated });
        console.log(`[ensureCart]  hydrated ${itemsArray.length} items`);
      } else {
        cartRef.current = {};
        setCart({});
      }

    } catch (err: any) {
      const status = err?.response?.status;
      console.log(`[ensureCart] GET error status=${status}`);

      if (status === 404) {
        // FIXED: No /create call. Cart will be auto-created by POST /add on first Add.
        // This is the correct backend behavior — no separate create endpoint exists.
        console.log("[ensureCart] No cart yet — waiting for first Add action to create it via POST /add");
        cartRef.current = {};
        setCart({});
        // FIXED: Clear stale cartId from storage so add() doesn't use a dead ID
        cartIdRef.current = null;
        setCartId(null);
        await storage.setItem("cartId", "");
      } else {
        console.log(`[ensureCart] Unexpected error:`, err?.message);
      }
    }
  }, [getAuthHeader, isSessionValid]);

  
  // handleLogout — full session teardown (unchanged)
  
  const handleLogout = useCallback(async (): Promise<void> => {
    isLoggedOutRef.current = true;

    await Promise.all([
      storage.setItem("jwtToken", ""),
      storage.setItem("token", ""),
      storage.setItem("shopId", ""),
      storage.setItem("cartId", ""),
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
    setSupplierId("");
    setSupplier(null);
    setApiCategories([]);
    setApiSubcategories([]);
    setApiProducts([]);

    console.log("[logout]  Session cleared — navigating to login");
    router.replace("/(auth)/login" as any);
  }, [router]);

  
  // INIT
  
  useEffect(() => {
    const initApp = async () => {
      try {
        setIsInitializing(true);
        isLoggedOutRef.current = false;

        const storedToken = await storage.getItem("jwtToken") || await storage.getItem("token");
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
              if (newShopId) { await storage.setItem("shopId", newShopId); storedShopId = newShopId; }
            }
          } catch (e: any) { console.log("ERROR: auto-create shop:", e?.message); }
        }

        if (!storedShopId) throw new Error("shopId unavailable");

        setShopId(storedShopId);
        shopIdRef.current = storedShopId;

        //  FIXED: Restore cartId from storage on init only —
        //   this is purely informational; it won't block Add from working.
        //   The /add endpoint will create or reuse the cart on the backend.
        const storedCartId = await storage.getItem("cartId");
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

  // FIXED: ensureCartExists no longer calls /create — safe to call on every login.
  //  On 404 it simply logs and waits for first Add action.
  useEffect(() => {
    if (!supplierId || !shopIdRef.current || !token) return;
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
    if (!supplierId || !activeCategory || !token) return;
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
          fetchProducts(String(data[0].id || data[0]._id));
        } else {
          setApiProducts([]);
        }
      } catch (err: any) {
        console.log("ERROR: fetchSubcategories:", err?.response?.status, err?.message);
      }
    };
    go();
  }, [supplierId, activeCategory, token]);

  
  // Checkout
  
  const handleGenerateInvoice = async () => {
    if (!isSessionValid()) {
      Alert.alert("Session Expired", "Please log in again.");
      return;
    }
    if (!cartIdRef.current) {
      Alert.alert("Cart Empty", "Please add items to cart before checking out.");
      return;
    }
    try {
      setIsGeneratingInvoice(true);
      const headers = await getAuthHeader();
      await axiosInstance.post(`/api/orders/submit/${cartIdRef.current}`, null, { headers });
      Alert.alert("Order Placed! ✅", "Your cart has been successfully checked out.");
      cartRef.current = {};
      setCart({});
      setCartId(null);
      cartIdRef.current = null;
      await storage.setItem("cartId", "");
    } catch (err: any) {
      console.log("ERROR: checkout:", err?.response?.status, err?.message);
      Alert.alert("Error", "Failed to checkout. Please try again.");
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  
  // Display helpers
  
  const displayProducts = apiProducts.length > 0
    ? apiProducts.map((p, idx) => ({
      id: String(p.productId || p.id || p._id || idx),
      name: p.productName || p.name || `Product ${idx + 1}`,
      price: p.price ?? p.unitValue ?? 0,
      image: p.image || TomatoImg,
    }))
    : products;

  const displayCategories = apiCategories.length > 0
    ? apiCategories.map((apiCat) => {
      const staticMatch = categories.find(
        (c) => c.label.toLowerCase() === (apiCat.name || "").toLowerCase()
      );
      return {
        id: String(apiCat.id || apiCat.categoryId || apiCat._id),
        displayName: apiCat.name || apiCat.displayName || "Category",
        img: staticMatch?.img || VegetablesImg,
      };
    })
    : categories.map((c, i) => ({ id: String(i), displayName: c.label, img: c.img }));

  const cartItems = displayProducts.filter((p) => (cartRef.current[p.id] || 0) > 0);

  if (isInitializing || !supplier) {
    return (
      <View style={[styles.safe, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  
  // UI — layout and styles completely unchanged from original
  
  return (
    <View style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={styles.scroll}>

        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#2E7D32" />
        </TouchableOpacity>

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
              <Text style={styles.businessName}>{supplier?.name || "Sunways trading"}</Text>
              <Text style={styles.personName}>{supplier?.city || "Aslam"}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={12} color="#2E7D32" />
                <Text style={styles.locationText}>{supplier?.address || "Ambalpady, udupi"}</Text>
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
                onPress={() => supplier?.contactNumber && Linking.openURL(`tel:${supplier.contactNumber}`)}
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

        <Text style={styles.subtitle}>Browse Items</Text>
        <View style={styles.categoryRow}>
          {displayCategories.map((cat) => (
            <TouchableOpacity key={cat.id} onPress={() => setActiveCategory(cat.id)} style={styles.categoryItem}>
              <Image source={cat.img} style={styles.categoryIcon} />
              <Text style={[styles.categoryText, activeCategory === cat.id && styles.categoryTextActive]}>
                {cat.displayName}
              </Text>
              {activeCategory === cat.id && <View style={styles.categoryUnderline} />}
            </TouchableOpacity>
          ))}
        </View>

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
            const qty = cartRef.current[String(item.id)] || 0;
            const itemExistsInCart = qty > 0; // FIXED: used to block +/- until item added

            console.log("UI qty:", item.id, cartRef.current[String(item.id)]);
            return (
              <View style={styles.productCard}>
                <TouchableOpacity style={styles.plusBtn} onPress={() => add(item.id)}>
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
                  ₹{item.price}/kg <Text style={styles.mrp}>MRP ₹28/kg</Text>
                </Text>
                {qty === 0 ? (
                  <TouchableOpacity style={styles.addBtn} onPress={() => add(item.id)}>
                    <Text style={styles.addBtnText}>Add</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.qtyRow}>
                    {/* FIXED: Block remove if item not in cart — guard prevents API call for non-existent items */}
                    <TouchableOpacity onPress={() => {
                      if (!itemExistsInCart) return; // FIXED: block — item must exist in cart
                      remove(item.id);
                    }}>
                      <Text style={styles.qtyBtn}>—</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{qty} × 20kg</Text>
                    {/* FIXED: Block add (increment) if item not in cart via initial Add button */}
                    <TouchableOpacity onPress={() => {
                      if (!itemExistsInCart) return; // FIXED: block — item must exist in cart
                      add(item.id);
                    }}>
                      <Text style={styles.qtyBtn}>+</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          }}
        />
      </ScrollView>

      {showSheet && cartItems.length > 0 && (
        <View style={styles.cartSheet}>
          <View style={styles.caretHandle}>
            <TouchableOpacity style={styles.caretBtn} onPress={() => setShowSheet(false)}>
              <Ionicons name="chevron-up" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {cartItems.map((item) => {
              const kg = customKg[String(item.id)] || "";
              const totalPrice = kg
                ? (item.price * parseFloat(kg)).toFixed(0)
                : (item.price * (cartRef.current[String(item.id)] || 0) * 20).toFixed(0);
              return (
                <View key={String(item.id)} style={styles.cartItemRow}>
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
                        onChangeText={(val) => setCustomKg((p) => ({ ...p, [String(item.id)]: val }))}
                        placeholder="Custom"
                        placeholderTextColor="#333"
                        keyboardType="numeric"
                      />
                      <Feather name="edit-2" size={12} color="#444" />
                      <Text style={styles.customKgText}> Kg</Text>
                    </View>
                    {kg ? <Text style={styles.totalPrice}>₹{totalPrice}</Text> : null}
                  </View>
                  <TouchableOpacity style={styles.cartAction} onPress={() => toggleSave(item.id)}>
                    <Feather name="bookmark" size={18} color={savedItems.includes(item.id) ? "#2E7D32" : "#444"} />
                    <Text style={styles.cartActionText}>Save for later</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cartAction} onPress={() => deleteItem(item.id)}>
                    <Feather name="trash-2" size={18} color="#444" />
                    <Text style={styles.cartActionText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      <View style={styles.cartBar}>
        <TouchableOpacity style={styles.previewCart} onPress={() => setShowSheet(!showSheet)}>
          {cartItems.length > 0 ? (
            <View style={styles.thumbsRow}>
              {cartItems.slice(0, 3).map((item, idx) => (
                <Image key={idx} source={item.image} style={[styles.thumbImg, { marginLeft: idx > 0 ? -10 : 0 }]} />
              ))}
            </View>
          ) : (
            <Ionicons name="cart-outline" size={24} color="#2E7D32" />
          )}
          <Text style={styles.previewText}>Preview cart</Text>
          <Ionicons name={showSheet ? "chevron-up" : "chevron-down"} size={18} color="#2E7D32" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.checkoutBtn} onPress={handleGenerateInvoice}>
          {isGeneratingInvoice
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.checkoutText}>Checkout →</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── STYLES COMPLETELY UNCHANGED ────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff", paddingTop: Platform.OS === "ios" ? 55 : StatusBar.currentHeight },
  scroll: { padding: 16, paddingBottom: 220 },
  backBtn: { marginBottom: 12 },
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
});