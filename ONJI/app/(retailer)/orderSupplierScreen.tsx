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
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome,
  Feather,
} from "@expo/vector-icons";
import axiosInstance from "../../lib/api/axiosConfig";
import { secureStorage } from "../../lib/secureStorage";
import { localStorage } from "../../lib/localStorage";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const PersonImg = require("../../assets/images/supplier.jpg");

// ─── Static delivery schedule data ───────────────────────────────────────────

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
  { label: "Afternoon", time: "12pm – 3pm", available: false },
  { label: "Evening", time: "3pm – 7pm", available: true },
];

// ─── Types ────────────────────────────────────────────────────────────────────

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

type Category = {
  id: string;
  displayName: string;
  img: any;
};

type Subcategory = {
  id: string;
  name: string;
};

// ─── Create Shop Modal ────────────────────────────────────────────────────────

interface CreateShopModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated: (shopId: string) => void;
  getAuthHeader: () => Promise<Record<string, string>>;
}

function CreateShopModal({
  visible,
  onClose,
  onCreated,
  getAuthHeader,
}: CreateShopModalProps) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !city.trim() || !pincode.trim() || !contact.trim()) {
      Alert.alert("Missing fields", "Please fill in all required fields.");
      return;
    }
    try {
      setLoading(true);
      const headers = await getAuthHeader();

      // Get retailer id first
      const rRes = await axiosInstance.get("/api/retailer-business/all", {
        headers,
      });
      const rData = rRes.data?.data || rRes.data;
      if (!Array.isArray(rData) || rData.length === 0) {
        Alert.alert("Error", "No retailer profile found.");
        return;
      }
      const retailerId = rData[0].retailerId || rData[0].id;

      const res = await axiosInstance.post(
        "/api/shops/create",
        {
          retailerId,
          name: name.trim(),
          city: city.trim(),
          state: state.trim() || "N/A",
          pincode: pincode.trim(),
          country: "India",
          contactNumber: contact.trim(),
          openingHours: ["9AM-9PM"],
          active: true,
        },
        { headers }
      );

      const newShopId = res.data?.id || res.data?.shopId;
      if (!newShopId) throw new Error("No shop ID returned");

      await localStorage.setItem("shopId", newShopId);
      onCreated(newShopId);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || e?.message || "Failed to create shop.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={shopModalStyles.overlay}>
        <View style={shopModalStyles.sheet}>
          <Text style={shopModalStyles.title}>Create Your Shop</Text>
          <Text style={shopModalStyles.subtitle}>
            You need a shop before placing orders. Fill in the details below.
          </Text>

          {[
            { label: "Shop Name *", value: name, set: setName, placeholder: "e.g. Fresh Mart" },
            { label: "City *", value: city, set: setCity, placeholder: "e.g. Udupi" },
            { label: "State", value: state, set: setState, placeholder: "e.g. Karnataka" },
            { label: "Pincode *", value: pincode, set: setPincode, placeholder: "e.g. 576101", numeric: true },
            { label: "Contact Number *", value: contact, set: setContact, placeholder: "e.g. 9876543210", numeric: true },
          ].map(({ label, value, set, placeholder, numeric }) => (
            <View key={label} style={shopModalStyles.field}>
              <Text style={shopModalStyles.fieldLabel}>{label}</Text>
              <TextInput
                style={shopModalStyles.input}
                value={value}
                onChangeText={set}
                placeholder={placeholder}
                placeholderTextColor="#aaa"
                keyboardType={numeric ? "numeric" : "default"}
              />
            </View>
          ))}

          <View style={shopModalStyles.btnRow}>
            <TouchableOpacity style={shopModalStyles.cancelBtn} onPress={onClose}>
              <Text style={shopModalStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={shopModalStyles.createBtn}
              onPress={handleCreate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={shopModalStyles.createText}>Create Shop</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function orderSupplierScreen() {
  const router = useRouter();
  const { supplierId, businessId, supplierName } = useLocalSearchParams<{
    supplierId: string;
    businessId: string;
    supplierName: string;
  }>();

  // ── UI state ──
  const [expanded, setExpanded] = useState(true);
  const [selectedDay, setSelectedDay] = useState("Thu");
  const [selectedTime, setSelectedTime] = useState("Morning0");
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [activeSubcategory, setActiveSubcategory] = useState<string>("");
  const [showSheet, setShowSheet] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [customKg, setCustomKg] = useState<Record<string, string>>({});

  // ── Cart state (source of truth for UI) ──
  const [cart, setCart] = useState<Record<string, number>>({});
  const cartRef = useRef<Record<string, number>>({});

  // ── Data state ──
  const [shopId, setShopId] = useState<string>("");
  const [cartId, setCartId] = useState<string | null>(null);
  const [apiCategories, setApiCategories] = useState<Category[]>([]);
  const [apiSubcategories, setApiSubcategories] = useState<Subcategory[]>([]);
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [cartProductsMap, setCartProductsMap] = useState<Record<string, Product>>({});
  const cartItemsRef = useRef<{ productId: string; quantity: number }[]>([]);
  // ── Loading/modal state ──
  const [isInitializing, setIsInitializing] = useState(true);
  const [showCreateShop, setShowCreateShop] = useState(false);

  // ── Refs ──
  const shopIdRef = useRef<string>("");
  const cartIdRef = useRef<string | null>(null);
  const tokenRef = useRef<string | null>(null);
  const supplierIdRef = useRef<string>("");
  const apiProductsRef = useRef<Record<string, Product>>({});

  // Debounce timers per product: we batch the final quantity after user stops tapping
  const debounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // ── Sync refs when state changes ──
  useEffect(() => { shopIdRef.current = shopId; }, [shopId]);
  useEffect(() => { supplierIdRef.current = String(supplierId || ""); }, [supplierId]);
  useEffect(() => { cartIdRef.current = cartId; }, [cartId]);
// ─── Load cached products from AsyncStorage on mount ─────────────────────────
const loadCachedProducts = useCallback(async () => {
  try {
    const cached = await localStorage.getItem("cachedProducts");
    if (cached) {
      apiProductsRef.current = JSON.parse(cached);
    }
  } catch (e) {
    console.log("[loadCachedProducts] error:", e);
  }
}, []);
  // ─── Auth helper ─────────────────────────────────────────────────────────────

  const getAuthHeader = useCallback(async (): Promise<Record<string, string>> => {
    const tok =
      (await secureStorage.getItem("jwtToken")) ||
      (await secureStorage.getItem("token"));
    tokenRef.current = tok ?? null;
    return tok ? { Authorization: `Bearer ${tok}` } : {};
  }, []);

  // ─── Initialization: check shop, load cart ────────────────────────────────────

  useEffect(() => {
    const init = async () => {
      try {
        setIsInitializing(true);
   // ✅ 1. Load cached products FIRST so fetchCart can find images
      await loadCachedProducts();
        // 1. Resolve shopId
        let storedShopId = await localStorage.getItem("shopId");

        if (!storedShopId) {
          // No shop → show create-shop modal
          setShowCreateShop(true);
          return;
        }

        setShopId(storedShopId);
        shopIdRef.current = storedShopId;

        // 2. Restore cartId from storage (if any)
        // const storedCartId = await localStorage.getItem("cartId");
        // if (storedCartId) {
        //   cartIdRef.current = storedCartId;
        //   setCartId(storedCartId);
        //   // when you fetch cart data
        // }

      } catch (e: any) {
        console.log("[init] error:", e?.message);
      } finally {
        setIsInitializing(false);
      }
    };

    init();
  }, []);

  // ─── Fetch cart items for this supplier ───────────────────────────────────────
useEffect(() => {
  // Si l'utilisateur navigue vers un autre fournisseur sans que l'écran
  // ne soit démonté, on efface l'état du fournisseur précédent AVANT
  // de fetch le nouveau, pour ne jamais afficher le cart du fournisseur A
  // en attendant la réponse pour le fournisseur B.
  cartIdRef.current = null;
  setCartId(null);
  cartRef.current = {};
  setCart({});
  setCartProductsMap({});
  cartItemsRef.current = [];
}, [supplierId]);

useEffect(() => {
  if (!shopId || !supplierId) return;
  fetchCart();
  fetchCategories();
}, [shopId, supplierId]);


const fetchCart = useCallback(async () => {
  const sId = shopIdRef.current;
  const suppId = supplierIdRef.current;
  if (!sId || !suppId) return;

  try {
    const headers = await getAuthHeader();
    const res = await axiosInstance.get(`/api/carts/${sId}/${suppId}/items`, { headers });
    const items = res.data;

    if (Array.isArray(items) && items.length > 0) {
      const returnedCartId = items[0]?.cartId || items[0]?.cart?.id;
      // ✅ toujours pris depuis la réponse API fraîche, jamais du storage
      cartIdRef.current = returnedCartId ?? null;
      setCartId(returnedCartId ?? null);

      const hydrated: Record<string, number> = {};
      const productsMap: Record<string, any> = {};

      cartItemsRef.current = items.map((item: any) => ({
        productId: String(item.productId || item.product?.id),
        quantity: item.quantity,
      }));

      items.forEach((item: any) => {
        const pid = String(item.productId || item.product?.id);
        hydrated[pid] = item.quantity;

        const existingProduct = apiProductsRef.current[pid];

        productsMap[pid] = {
          id: pid,
          name: item.productName || item.product?.name || pid,
          price: Number(item.price || item.product?.price || existingProduct?.price || 0),
          image: item.imageUrl
            ? { uri: item.imageUrl }
            : existingProduct?.image || null,
          unit: item.unit || "kg",
          minOrderQuantity: item.minOrderQuantity || 1,
          stock: item.stock || 0,
          description: item.description || "",
        };

        apiProductsRef.current[pid] = productsMap[pid];
      });

      cartRef.current = hydrated;
      setCart(hydrated);
      setCartProductsMap(productsMap);

      // ✅ on garde uniquement le cache produits (images), jamais cartId
      await localStorage.setItem("cachedProducts", JSON.stringify(apiProductsRef.current));
    } else {
      // Ce fournisseur n'a pas (ou plus) de cart → état vide, propre à CE fournisseur
      cartItemsRef.current = [];
      cartIdRef.current = null;
      setCartId(null);
      cartRef.current = {};
      setCart({});
      setCartProductsMap({});
    }
  } catch (e: any) {
    if (e?.response?.status === 404) {
      cartIdRef.current = null;
      setCartId(null);
      cartRef.current = {};
      setCart({});
      cartItemsRef.current = [];
      setCartProductsMap({}) ;

    } else {
      console.log("[fetchCart] error:", e?.message);
    }
  }
}, [getAuthHeader]);
  // ─── Fetch categories ─────────────────────────────────────────────────────────
useFocusEffect(
  useCallback(() => {
    if (!shopId || !supplierId) return;
    fetchCart();
  }, [shopId, supplierId, fetchCart])
);

  const fetchCategories = useCallback(async () => {
    try {
      const headers = await getAuthHeader();
      const res = await axiosInstance.get(
        `/suppliers/${supplierId}/categories`,
        { headers }
      );
      const data: any[] = res.data?.data || res.data || [];

      const mapped: Category[] = data.map((c: any) => ({
        id: String(c.id || c.categoryId || c._id),
        displayName: c.name || c.displayName || "Category",
        img:
          c.imageUrl && c.imageUrl.startsWith("http")
            ? { uri: c.imageUrl }
            : null,
      }));

      setApiCategories(mapped);

      if (mapped.length > 0) {
        setActiveCategory(mapped[0].id);
      }
    } catch (e: any) {
      console.log("[fetchCategories] error:", e?.response?.status, e?.message);
    }
  }, [supplierId, getAuthHeader]);

  // ─── Fetch subcategories when activeCategory changes ──────────────────────────

  useEffect(() => {
    if (!activeCategory || !supplierId) return;

    const fetchSubs = async () => {
      try {
        const headers = await getAuthHeader();
        const res = await axiosInstance.get(
          `/suppliers/${supplierId}/categories/${activeCategory}/subcategories`,
          { headers }
        );
        const data: any[] = res.data?.data || res.data || [];

        const mapped: Subcategory[] = data.map((s: any) => ({
          id: String(s.id || s._id),
          name: s.name || "Subcategory",
        }));

        setApiSubcategories(mapped);
        setApiProducts([]); // Clear products while loading

        if (mapped.length > 0) {
          setActiveSubcategory(mapped[0].id);
        } else {
          setActiveSubcategory("");
        }
      } catch (e: any) {
        console.log("[fetchSubcategories] error:", e?.response?.status, e?.message);
      }
    };

    fetchSubs();
  }, [activeCategory, supplierId, getAuthHeader]);

  // ─── Fetch products when activeSubcategory changes ────────────────────────────

useEffect(() => {
  if (!activeSubcategory) return;

const fetchProducts = async () => {
    try {
      const headers = await getAuthHeader();
      const res = await axiosInstance.get(
        `/api/products/by-subcategory/${activeSubcategory}`,
        { headers }
      );
      const data: any[] = res.data?.data || res.data || [];

      const mapped: Product[] = data.map((p: any, idx: number) => ({
        id: String(p.productId || p.id || idx),
        name: p.name || `Product ${idx + 1}`,
        price: Number(p.price ?? 0),
        image:
          p.imageUrl && p.imageUrl.startsWith("http")
            ? { uri: p.imageUrl }
            : null,
        minOrderQuantity: p.minOrderQuantity ?? 1,
        unit: p.quantityType === "COUNT" ? "pcs" : "kg",
        stock: p.stockQuantity ?? 0,
        description: p.description ?? "",
      }));

      setApiProducts(mapped);

// ✅ accumulate ALL products across all subcategories
mapped.forEach(p => {
  apiProductsRef.current[p.id] = p;
});

// // ✅ persist to AsyncStorage for next reload
// await localStorage.setItem(
//   "cachedProducts",
//   JSON.stringify(apiProductsRef.current)
// );

    } catch (e: any) {
      console.log("[fetchProducts] error:", e?.response?.status, e?.message);
    }
  };

  fetchProducts();
}, [activeSubcategory, getAuthHeader]);
  // ─── Run fetch cart + categories once shop is ready ───────────────────────────

  useEffect(() => {
    if (!shopId || !supplierId) return;
    fetchCart();
    fetchCategories();
  }, [shopId, supplierId]);

  // ─── Debounced cart sync to backend ──────────────────────────────────────────
  /**
   * Called after every add/remove. Fires the API 800ms after the last call
   * for that product, so rapid tapping only sends ONE request.
   */
const scheduleSync = useCallback(
  (productId: string, quantity: number) => {
    if (debounceRef.current[productId]) {
      clearTimeout(debounceRef.current[productId]);
    }

    debounceRef.current[productId] = setTimeout(async () => {
      try {
        const headers = await getAuthHeader();

        const isExistingProduct = cartItemsRef.current?.some(
          (item) => item.productId === productId
        );

        if (!cartIdRef.current) {
          // ✅ No cart yet → create via /add
          const res = await axiosInstance.post(
            `/api/carts/${shopIdRef.current}/${supplierIdRef.current}/add`,
            null,
            { params: { productId, quantity }, headers }
          );
          const newCartId = res.data?.id || res.data?.cartId;
          if (newCartId) {
            cartIdRef.current = newCartId;
            setCartId(newCartId);
            cartItemsRef.current = [{ productId, quantity }];
                // ✅ save cartId + cachedProducts TOGETHER
    await Promise.all([
      // localStorage.setItem("cartId", newCartId),
      localStorage.setItem("cachedProducts", JSON.stringify(apiProductsRef.current)),
    ]);
          }

        } else if (!isExistingProduct && quantity > 0) {
          // ✅ Cart exists, new product → /add
          await axiosInstance.post(
            `/api/carts/${shopIdRef.current}/${supplierIdRef.current}/add`,
            null,
            { params: { productId, quantity }, headers }
          );
          cartItemsRef.current = [
            ...(cartItemsRef.current || []),
            { productId, quantity },
          ];

        } else if (isExistingProduct && quantity <= 0) {
          // ✅ Remove product from cart
          await axiosInstance.delete(
            `/api/carts/${cartIdRef.current}/remove`,
            { params: { productId }, headers }
          );
          cartItemsRef.current = cartItemsRef.current?.filter(
            (item) => item.productId !== productId
          );
if (!cartItemsRef.current?.length) {
  console.log("Cart is empty");

  await Promise.all([
    // localStorage.removeItem("cartId"),
    localStorage.removeItem("cachedProducts"),
  ]);

  cartIdRef.current = null;
  setCartId(null);

  cartRef.current = {};
  setCart({});
  setCartProductsMap({});
  cartItemsRef.current = [];
}
          // // ✅ Check if cart is now empty
          // const remainingItems = Object.values(cartRef.current).filter(q => q > 0);
          // if (remainingItems.length === 0) {
          // //   // Delete cart from DB
            // try {
            //   await axiosInstance.delete(
            //     `/api/carts/${cartIdRef.current}/remove`,
            //     { headers }
            //   );
            // } catch (e: any) {
            //   console.log("[scheduleSync] delete cart error:", e?.message);
            // }

            // Clear localStorage
          // await Promise.all([
  //   localStorage.removeItem("cartId"),
  //   localStorage.removeItem("cachedProducts"),
  // ]);

  //           // Reset all state
  //           cartIdRef.current = null;
  //           setCartId(null);
  //           cartRef.current = {};
  //           setCart({});
  //           setCartProductsMap({});
  //           cartItemsRef.current = [];
  //         }

        } else if (isExistingProduct && quantity > 0) {
          // ✅ Update quantity
          await axiosInstance.put(
            `/api/carts/${cartIdRef.current}/update`,
            null,
            { params: { productId, quantity }, headers }
          );
          // update quantity in cartItemsRef
          cartItemsRef.current = cartItemsRef.current.map(item =>
            item.productId === productId ? { ...item, quantity } : item
          );
        }

      } catch (e: any) {
        console.log("[scheduleSync] error:", e?.message);
      }
    }, 800);
  },
  [getAuthHeader]
);

  // ─── Add product ──────────────────────────────────────────────────────────────

  const add = useCallback(
    (product: Product) => {
      const strId = String(product.id);
      const newQty = (cartRef.current[strId] || 0) + 1;
      cartRef.current[strId] = newQty;
      setCart({ ...cartRef.current });

      // Keep a snapshot of this product for the cart preview
      setCartProductsMap((prev) => ({ ...prev, [strId]: product }));

      scheduleSync(strId, newQty);
    },
    [scheduleSync]
  );

  // ─── Remove product ───────────────────────────────────────────────────────────

  const remove = useCallback(
    (productId: string) => {
      const strId = String(productId);
      const currentQty = cartRef.current[strId] || 0;
      if (currentQty <= 0) return;

      const newQty = currentQty - 1;

      if (newQty <= 0) {
        delete cartRef.current[strId];
        setCartProductsMap((prev) => {
          const next = { ...prev };
          delete next[strId];
          return next;
        });
      } else {
        cartRef.current[strId] = newQty;
      }

      setCart({ ...cartRef.current });
      scheduleSync(strId, newQty);
    },
    [scheduleSync]
  );

  // ─── Loading screen ───────────────────────────────────────────────────────────

  if (isInitializing) {
    return (
      <View style={[styles.safe, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Create Shop Modal */}
      <CreateShopModal
        visible={showCreateShop}
        onClose={() => {
          setShowCreateShop(false);
          router.back();
        }}
        onCreated={(newShopId) => {
          setShopId(newShopId);
          shopIdRef.current = newShopId;
          setShowCreateShop(false);
        }}
        getAuthHeader={getAuthHeader}
      />

      {/* Fullscreen Image Modal */}
      <Modal visible={showImageViewer} transparent animationType="fade">
        <View style={styles.imageModalOverlay}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setShowImageViewer(false)}
          >
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>
          <Image
            source={selectedImage}
            style={styles.fullscreenImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
      <SafeAreaView>
      <TouchableOpacity  onPress={() => router.push("/(retailer)/(tabs)/supplier")} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={22} color="#2E7D32" />
      </TouchableOpacity>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Business card */}
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
              <Text style={styles.businessName}>{supplierName || "Sunways trading"}</Text>
              <Text style={styles.personName}>{supplierName || "Aslam"}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={12} color="#2E7D32" />
                <Text style={styles.locationText}>Ambalpady, Udupi</Text>
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
                <Text style={styles.ratingText}>4.5 (6)</Text>
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
                onPress={() => Linking.openURL(`tel:${supplierName}`)}
              >
                <Ionicons name="call" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Deliver to */}
        <View style={styles.deliverToRow}>
          <Text style={styles.deliverToText}>
            Deliver to:{" "}
            <Text style={styles.deliverToBold}>North west, Ambalpady</Text>
          </Text>
          <TouchableOpacity>
            <Text style={styles.changeLink}>Change</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Schedule delivery */}
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
              {selectedDay === item.day && <View style={styles.dotIndicator} />}
              <Text
                style={[
                  styles.dayText,
                  selectedDay === item.day && styles.dayTextActive,
                  !item.available && styles.dayTextDisabled,
                ]}
              >
                {item.day}
              </Text>
              <Text
                style={[
                  styles.dateText,
                  selectedDay === item.day && styles.dayTextActive,
                  !item.available && styles.dayTextDisabled,
                ]}
              >
                {item.date}
              </Text>
              {!item.available && (
                <Text style={styles.unavailableText}>Unavailable</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Time slots */}
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
                <View
                  style={[
                    styles.radioOuter,
                    selectedTime === slot.label + i && styles.radioOuterActive,
                  ]}
                >
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

        {/* Categories */}
        <View style={styles.categoryBox}>
          <Text style={styles.sectionTitle}>Browse by Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryRow}>
              {apiCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setActiveCategory(cat.id)}
                  style={styles.categoryItem}
                >
                  {cat.img && (
                    <Image source={cat.img} style={styles.categoryIcon} />
                  )}
                  <Text
                    style={[
                      styles.categoryText,
                      activeCategory === cat.id && styles.categoryTextActive,
                    ]}
                  >
                    {cat.displayName}
                  </Text>
                  {activeCategory === cat.id && (
                    <View style={styles.categoryUnderline} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Subcategories */}
        {apiSubcategories.length > 0 && (
          <View style={styles.subcategoryBox}>
            <Text style={styles.sectionTitle}>Related Options</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.subcategoryRow}>
                {apiSubcategories.map((sub) => (
                  <TouchableOpacity
                    key={sub.id}
                    onPress={() => setActiveSubcategory(sub.id)}
                    style={[
                      styles.subcategoryItem,
                      activeSubcategory === sub.id &&
                        styles.subcategoryItemActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.subcategoryText,
                        activeSubcategory === sub.id &&
                          styles.subcategoryTextActive,
                      ]}
                    >
                      {sub.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Search + filter */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <TextInput
              placeholder='Search "apple"'
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
              <Feather name="arrow-down" size={18} color="#444" />
              <Text style={styles.filterText}>Sort</Text>
            </View>
          </View>
        </View>

        {/* Products */}
        {apiProducts.length === 0 ? (
          <View style={styles.emptyProducts}>
            <Ionicons name="cube-outline" size={40} color="#ccc" />
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        ) : (
          <FlatList
            data={apiProducts}
            numColumns={2}
            scrollEnabled={false}
            extraData={cart}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => {
              const qty = cart[String(item.id)] || 0;
              return (
                <View style={styles.productCard}>
                  <TouchableOpacity
                    style={styles.imgBox}
                    onPress={() => {
                      setSelectedImage(item.image);
                      setShowImageViewer(true);
                    }}
                  >
                    {item.image ? (
                      <Image source={item.image} style={styles.productImg} />
                    ) : (
                      <Ionicons name="image-outline" size={40} color="#ccc" />
                    )}
                  </TouchableOpacity>

                  <Text style={styles.minQty}>
                    Min: {item.minOrderQuantity} {item.unit}
                  </Text>
                  <Text style={styles.productName}>{item.name}</Text>
                  {item.description ? (
                    <Text style={styles.productSub}>{item.description}</Text>
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
                      <Text style={styles.addBtnText}>Add</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.qtyRow}>
                      <TouchableOpacity onPress={() => remove(item.id)}>
                        <Text style={styles.qtyBtn}>—</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>
                        {qty} × {item.unit}
                      </Text>
                      <TouchableOpacity onPress={() => add(item)}>
                        <Text style={styles.qtyBtn}>+</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            }}
          />
        )}
      </ScrollView>

      {/* Cart preview sheet */}
      {showSheet && Object.keys(cartProductsMap).length > 0 && (
        <View style={styles.cartSheet}>
          <View style={styles.caretHandle}>
            <TouchableOpacity
              style={styles.caretBtn}
              onPress={() => setShowSheet(false)}
            >
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
                : (item.price * qty).toFixed(0);

              return (
                <View key={productId} style={styles.cartItemRow}>
                  <TouchableOpacity
                    style={styles.cartItemImgBox}
                    onPress={() => {
                      setSelectedImage(item.image);
                      setShowImageViewer(true);
                    }}
                  >
                    {item.image ? (
                      <Image source={item.image} style={styles.cartItemImg} />
                    ) : (
                      <Ionicons name="cube-outline" size={24} color="#fff" />
                    )}
                  </TouchableOpacity>

                  <View style={styles.cartItemInfo}>
                    <Text style={styles.cartItemName}>{item.name}</Text>
                    <Text style={styles.cartItemPrice}>
                      ₹{item.price}/{item.unit}
                    </Text>                
                  </View>

             <View style={styles.customKgBox}>
  <View style={styles.customKgInputRow}>
    <TextInput
      style={styles.customKgInput}
      value={String(qty)}                    // ✅ show actual qty
      keyboardType="number-pad"
      selectTextOnFocus
      onChangeText={(val) => {
        const n = parseInt(val.replace(/[^0-9]/g, ""), 10);
        if (isNaN(n) || n < 0) return;
        const strId = String(productId);
        if (n === 0) {
          delete cartRef.current[strId];
          setCartProductsMap((prev) => {
            const next = { ...prev };
            delete next[strId];
            return next;
          });
        } else {
          cartRef.current[strId] = n;
        }
        setCart({ ...cartRef.current });
        scheduleSync(strId, n);
      }}
    />
    <Text style={styles.customKgText}>{` ${item.unit}`}</Text>
    {/* <Feather name="edit-2" size={12} color="#444" /> */}

  </View>
  {/* ✅ price always shown, updates automatically */}
  <Text style={styles.totalPrice}>₹ {(item.price * qty).toFixed(0)}</Text>
</View>  
{/* <View style={styles.itemAction}> */}
  <TouchableOpacity style={styles.itemAction}>
    <Feather name="bookmark" size={18} color="#444" />
    <Text style={styles.itemActionText}>Save</Text>
  </TouchableOpacity>

  <TouchableOpacity style={styles.itemAction}>
    <Feather name="trash-2" size={18} color="#444" />
    <Text style={[styles.itemActionText, { color: "#444" }]}>
      Delete
    </Text>
  </TouchableOpacity>
{/* </View> */}
                </View>
              );
              
            })}
          </ScrollView>
        </View>
      )}

      {/* Bottom bar */}
      <View style={styles.cartBar}>
        <TouchableOpacity
          style={styles.previewCart}
          onPress={() => {
            if (Object.keys(cartProductsMap).length === 0) {
              Alert.alert("Cart is empty", "Add some products first!");
              return;
            }
            setShowSheet(!showSheet);
          }}
        >
          {Object.keys(cartProductsMap).length > 0 ? (
            <View style={styles.thumbsRow}>
              {Object.values(cartProductsMap)
                .slice(0, 3)
                .map((item, idx) =>
                  item.image ? (
                    <Image
                      key={idx}
                      source={item.image}
                      style={[
                        styles.thumbImg,
                        { marginLeft: idx > 0 ? -10 : 0 },
                      ]}
                    />
                  ) : null
                )}
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

        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => {
            if (!cartIdRef.current) {
              Alert.alert("Cart is empty", "Add some products first!");
              return;
            }
            router.push({
              pathname: "/(retailer)/checkout",
              params: {
                cart: JSON.stringify({
                  supplierId,
                  supplierName,
                  cartId: cartIdRef.current,
                  items: Object.entries(cart).map(([productId, qty]) => ({
                    productId,
                    quantity: qty,
                    ...cartProductsMap[productId],
                  })),
                }),
              },
            });
          }}
        >
          <Text style={styles.checkoutText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "ios" ? 55 : StatusBar.currentHeight,
  },
  scroll: { padding: 15, paddingBottom: 220 },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 5,
    paddingTop: 5,
    marginTop: 15,
  },
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
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 2,
  },
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
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
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
  subtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
    marginBottom: 12,
  },
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
  categoryBox: { marginTop: 10, marginBottom: 15 },
  categoryRow: { flexDirection: "row", gap: 16 },
  categoryItem: { alignItems: "center", minWidth: 60 },
  categoryIcon: { width: 40, height: 40, borderRadius: 8 },
  categoryText: { fontSize: 12, color: "#777", marginTop: 4, textAlign: "center" },
  categoryTextActive: { color: "#2E7D32", fontWeight: "600" },
  categoryUnderline: {
    height: 2,
    width: "100%",
    backgroundColor: "#2E7D32",
    marginTop: 4,
  },
  subcategoryBox: { marginBottom: 16 },
  subcategoryRow: { flexDirection: "row", flexWrap: "nowrap" },
  subcategoryItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#F1F1F1",
    borderRadius: 20,
    marginRight: 10,
  },
  subcategoryItemActive: { backgroundColor: "#2E7D32" },
  subcategoryText: { color: "#333", fontSize: 13 },
  subcategoryTextActive: { color: "#fff" },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
    marginBottom: 10,
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
  emptyProducts: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 8,
  },
  emptyText: { color: "#aaa", fontSize: 14 },
  productCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 10,
    marginBottom: 12,
  },
  imgBox: {
    backgroundColor: "#F0E8FF",
    borderRadius: 10,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  productImg: { width: 100, height: 100, resizeMode: "contain" },
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
  itemAction: { alignItems: "center", gap: 2 },
  itemActionText: { fontSize: 10, color: "#0d0d0d" },

  productName: { fontSize: 13, fontWeight: "700", color: "#111" },
  productSub: { fontSize: 10, color: "#777", marginTop: 2 },
  productPrice: { fontSize: 13, fontWeight: "700", marginTop: 2 },
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
    maxHeight: "60%",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  caretHandle: { alignItems: "center", marginBottom: 8 },
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
  },
  cartItemImg: { width: 36, height: 36, borderRadius: 18 },
  cartItemInfo: { flex: 1 },
  cartItemName: { fontSize: 13, fontWeight: "600", color: "#111" },
  cartItemPrice: { fontSize: 12, color: "#666", marginTop: 2 },
  customKgBox: {
    alignItems: "center",
    // borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingBottom: 8,
    minWidth: 80,
  },
  customKgInputRow: { flexDirection: "row", alignItems: "center" },
  customKgInput: {
    borderBottomWidth: 1,
    fontSize: 12,
    color: "#333",
    minWidth: 50,
    textAlign: "center",
    padding: 0,
  },
  customKgText: { fontSize: 14, color: "#333" },
  totalPrice: { fontSize: 12, color: "#111", fontWeight: "600", marginTop: 2 },
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
  previewText: { flex: 1, color: "#2E7D32", fontWeight: "600", fontSize: 13 },
  checkoutBtn: {
    flex: 1,
    backgroundColor: "#2E7D32",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  checkoutText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtn: { position: "absolute", top: 50, right: 20, zIndex: 10 },
  fullscreenImage: { width: "90%", height: "80%" },
});

// ─── Create Shop Modal Styles ─────────────────────────────────────────────────

const shopModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 20,
    lineHeight: 18,
  },
  field: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 12,
    color: "#555",
    fontWeight: "600",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111",
    backgroundColor: "#fafafa",
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelText: { fontSize: 14, color: "#555", fontWeight: "600" },
  createBtn: {
    flex: 2,
    backgroundColor: "#2E7D32",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  createText: { fontSize: 14, color: "#fff", fontWeight: "700" },
});