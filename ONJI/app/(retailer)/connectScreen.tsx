
import { FontAwesome, Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import React, { useRef, useState, useEffect } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { secureStorage } from '@/lib/secureStorage';
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

  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["All", "Vegetables", "Fruits", "Leafy", "Masala", "Dairy", "Spices", "Snacks"]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
const [modalVisible, setModalVisible] = useState(false);
const modalAnim = useRef(new Animated.Value(0)).current;

  const connectScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get(`/api/products/by-supplier/${supplierId}`);
        const data = response.data?.data || response.data || [];
        setProducts(data);
        setFilteredProducts(data);

        const cats = new Set<string>(["Vegetables", "Fruits", "Leafy", "Masala", "Dairy", "Spices", "Snacks"]);
        data.forEach((p: any) => {
          if (typeof p.category === 'string') cats.add(p.category);
          else if (p.category?.name) cats.add(p.category.name);
          else if (p.category?.categoryName) cats.add(p.category.categoryName);
          else if (p.subCategory?.category?.categoryName) cats.add(p.subCategory.category.categoryName);
          else if (p.subCategory?.subCategoryName) cats.add(p.subCategory.subCategoryName);
        });
        setCategories(["All", ...Array.from(cats)]);
      } catch (error) {
        console.log("Products fetch error:", error);
      }
    };

    if (supplierId) {
      fetchProducts();
    }
  }, [supplierId]);

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
          const retailerId = await secureStorage.getItem("userId");

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

    const retailerId = await secureStorage.getItem("userId");

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

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    filterData(text, selectedCategory, selectedSubCategory);
  };

  const getCategoryProductCount = (cat: string): number => {
  if (cat === "All") return products.length;
  const lowerCat = cat.toLowerCase();
  return products.filter((p: any) => {
    const c1 = typeof p.category === 'string' ? p.category.toLowerCase() : "";
    const c2 = p.category?.name ? p.category.name.toLowerCase() : "";
    const c3 = p.category?.categoryName ? p.category.categoryName.toLowerCase() : "";
    const c4 = p.subCategory?.category?.categoryName ? p.subCategory.category.categoryName.toLowerCase() : "";
    const c5 = p.subCategory?.subCategoryName ? p.subCategory.subCategoryName.toLowerCase() : "";
    const pName = (p.productName || p.name || p.subCategory?.subCategoryName || "").toLowerCase();
    return c1 === lowerCat || c1.includes(lowerCat) || c2 === lowerCat || c2.includes(lowerCat) ||
           c3 === lowerCat || c3.includes(lowerCat) || c4 === lowerCat || c4.includes(lowerCat) ||
           c5 === lowerCat || c5.includes(lowerCat) || pName.includes(lowerCat);
  }).length;
};

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedSubCategory("All");

    if (cat === "All") {
      setSubCategories([]);
    } else {
      const lowerCat = cat.toLowerCase();
      const subs = new Set<string>();
      
      
      if (lowerCat === "masala") {
        subs.add("Chicken Masala");
        subs.add("Fish Masala");
        subs.add("Korma Masala");
        subs.add("Kabab Masala");
        subs.add("Mutton Masala");
      }

      products.forEach((p: any) => {
        const c1 = typeof p.category === 'string' ? p.category.toLowerCase() : "";
        const c2 = p.category?.name ? p.category.name.toLowerCase() : "";
        const c3 = p.category?.categoryName ? p.category.categoryName.toLowerCase() : "";
        const c4 = p.subCategory?.category?.categoryName ? p.subCategory.category.categoryName.toLowerCase() : "";
        const c5 = p.subCategory?.subCategoryName ? p.subCategory.subCategoryName.toLowerCase() : "";
        const pName = (p.productName || p.name || p.subCategory?.subCategoryName || "").toLowerCase();
        
        if (c1 === lowerCat || c1.includes(lowerCat) || c2 === lowerCat || c2.includes(lowerCat) || c3 === lowerCat || c3.includes(lowerCat) || c4 === lowerCat || c4.includes(lowerCat) || c5 === lowerCat || c5.includes(lowerCat) || pName.includes(lowerCat)) {
          if (p.subCategory?.subCategoryName) {
            subs.add(p.subCategory.subCategoryName);
          }
        }
      });
      if (subs.size > 0) {
        setSubCategories(["All", ...Array.from(subs)]);
      } else {
        setSubCategories([]);
      }
    }

    filterData(searchQuery, cat, "All");
  };

  const handleSubCategorySelect = (subCat: string) => {
    setSelectedSubCategory(subCat);
    filterData(searchQuery, selectedCategory, subCat);
  };

  const getCategoryIcon = (catName: string) => {
    switch (catName.toLowerCase()) {
      case "vegetables":
      case "vegetable":
        return require("../../assets/images/Vegetables.png");
      case "fruits":
      case "fruit":
        return require("../../assets/images/Fruits.png");
      case "leafy":
        return require("../../assets/images/Leafy.png");
      default:
        // Use a generic groceries icon or fallback
        return require("../../assets/images/Groceries.png");
    }
  };

  const filterData = (query: string, cat: string, subCat: string) => {
    let filtered = products;
    
    // 1. Filter by Main Category
    if (cat !== "All") {
      const lowerCat = cat.toLowerCase();
      filtered = filtered.filter((p: any) => {
        const c1 = typeof p.category === 'string' ? p.category.toLowerCase() : "";
        const c2 = p.category?.name ? p.category.name.toLowerCase() : "";
        const c3 = p.category?.categoryName ? p.category.categoryName.toLowerCase() : "";
        const c4 = p.subCategory?.category?.categoryName ? p.subCategory.category.categoryName.toLowerCase() : "";
        const c5 = p.subCategory?.subCategoryName ? p.subCategory.subCategoryName.toLowerCase() : "";
        const pName = (p.productName || p.name || p.subCategory?.subCategoryName || "").toLowerCase();
        
        return c1 === lowerCat || c1.includes(lowerCat) ||
               c2 === lowerCat || c2.includes(lowerCat) || 
               c3 === lowerCat || c3.includes(lowerCat) ||
               c4 === lowerCat || c4.includes(lowerCat) ||
               c5 === lowerCat || c5.includes(lowerCat) ||
               pName.includes(lowerCat); 
      });
    }

    // 2. Filter by SubCategory (Pill selection)
    if (subCat !== "All") {
      const lowerSub = subCat.toLowerCase();
      filtered = filtered.filter((p: any) => {
        const sName = p.subCategory?.subCategoryName ? p.subCategory.subCategoryName.toLowerCase() : "";
        const pName = (p.productName || p.name || "").toLowerCase();
        // If it's something like "Chicken Masala", match "chicken" inside the name too
        const subBaseWord = lowerSub.replace(" masala", ""); 
        return sName === lowerSub || sName.includes(lowerSub) || pName.includes(subBaseWord);
      });
    }

    // 3. Filter by Search Query
    if (query) {
      filtered = filtered.filter((p: any) => {
        const name = p.productName || p.name || p.subCategory?.subCategoryName || "";
        return name.toLowerCase().includes(query.toLowerCase());
      });
    }
    setFilteredProducts(filtered);
  };

  const openProductModal = (item: any) => {
  setSelectedProduct(item);
  setModalVisible(true);
  Animated.spring(modalAnim, {
    toValue: 1,
    useNativeDriver: true,
    tension: 65,
    friction: 11,
  }).start();
};

const closeProductModal = () => {
  Animated.timing(modalAnim, {
    toValue: 0,
    duration: 200,
    easing: Easing.ease,
    useNativeDriver: true,
  }).start(() => {
    setModalVisible(false);
    setSelectedProduct(null);
  });
};

  const renderProduct = ({ item }: { item: any }) => {
    const name = item.productName || item.name || item.subCategory?.subCategoryName || "Unknown Product";
    const minQty = item.quantity || item.minQuantity || "10kg";
    const priceAsYesterday = item.priceAsOfYesterday || item.originalPrice || item.price || 0;
    const discount = item.discountPercentage || item.discount || 0;
    const currentPrice = item.sellingPrice || item.price || 0;
    const mrp = item.mrp || currentPrice;
    
    
    // We try to find the best image url
    let imageUrl = "https://via.placeholder.com/100";
    if (item.imageUrl) imageUrl = item.imageUrl;
    else if (item.image) imageUrl = item.image;
    else if (item.subCategory?.imageUrl) imageUrl = item.subCategory.imageUrl;

    return (
  <TouchableOpacity
    style={styles.productCardContainer}
    onPress={() => openProductModal(item)}
    activeOpacity={0.85}
  >
    <View style={styles.imageContainer}>
      <Image 
        source={{ uri: imageUrl }} 
        style={styles.productImage} 
        resizeMode="contain"
      />
      <View style={styles.minQtyBadge}>
        <Text style={styles.minQtyText}>Min quantity: {minQty}</Text>
      </View>
    </View>
    
    <View style={styles.productDetailsInfo}>
      <Text style={styles.productName}>{name.toUpperCase()}</Text>
      <Text style={styles.yesterdayPrice}>Price as of yesterday: {priceAsYesterday}/kg</Text>
      {discount > 0 && <Text style={styles.discountText}>{discount}% off</Text>}
      
      <View style={styles.priceContainerRow}>
        <Text style={styles.currentPrice}>₹ {currentPrice}/kg</Text>
        {mrp > currentPrice && <Text style={styles.mrpText}>MRP ₹{mrp}/kg</Text>}
      </View>
    </View>
  </TouchableOpacity>  // <-- was </View>
);
  };

  const renderHeader = () => (
    <View style={{ paddingBottom: 20 }}>
      {/* Back */}
      <TouchableOpacity
        style={{ marginLeft: 10, marginTop: 10, marginBottom: 10 }}
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
            <Ionicons name="checkmark-circle-outline" size={12} color="grey" />    
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

      {/* Browse Items Section Header */}
      <View style={styles.browseSection}>
        <Text style={styles.browseTitle}>Browse Items</Text>
        
        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoriesScroll}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {categories.map((cat, index) => {
  const isEmpty = getCategoryProductCount(cat) === 0;
  return (
    <TouchableOpacity
      key={index}
      style={[
        styles.categoryItem,
        selectedCategory === cat && styles.categoryItemSelected,
        cat === "All" && { justifyContent: "center" },
        isEmpty && styles.categoryItemDisabled,   // <-- greyed out
      ]}
      onPress={() => !isEmpty && handleCategorySelect(cat)}  // <-- blocked
      activeOpacity={isEmpty ? 1 : 0.7}                     // <-- no press feedback
    >
      {cat !== "All" && (
        <Image
          source={getCategoryIcon(cat)}
          style={[styles.categoryIcon, isEmpty && styles.categoryIconDisabled]}
          resizeMode="contain"
        />
      )}
      <Text style={[
        styles.categoryText,
        selectedCategory === cat && styles.categoryTextSelected,
        isEmpty && styles.categoryTextDisabled,   // <-- greyed text
      ]}>
        {cat}
      </Text>
    </TouchableOpacity>
  );
})}
        </ScrollView>

        {/* Subcategories (Related Options) */}
        {subCategories.length > 0 && (
          <View style={styles.subCategorySection}>
            <Text style={styles.subCategoryTitle}>Related Options</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subCategoriesScroll}>
              {subCategories.map((sub, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.subCategoryPill,
                    selectedSubCategory === sub && styles.subCategoryPillSelected
                  ]}
                  onPress={() => handleSubCategorySelect(sub)}
                >
                  <Text style={[
                    styles.subCategoryPillText,
                    selectedSubCategory === sub && styles.subCategoryPillTextSelected
                  ]}>
                    {sub}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <TextInput
              placeholder='Search "Random kaka"'
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={handleSearch}
            />
            <EvilIcons name="search" size={24} color="grey" />
          </View>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="filter-outline" size={20} color="#4A7A3A" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="bookmark-outline" size={20} color="#4A7A3A" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <FlatList
        data={filteredProducts}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={renderProduct}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="basket-off-outline" size={60} color="#D1D5DB" />
            <Text style={styles.emptyText}>No products available</Text>
            <Text style={styles.emptySubText}>Try selecting a different category or search item.</Text>
          </View>
        }
        columnWrapperStyle={filteredProducts.length > 0 ? styles.productGridRow : undefined}
        contentContainerStyle={[
          { paddingBottom: 20 },
          filteredProducts.length === 0 && { flexGrow: 1 }
        ]}
      />
      {/* Product Zoom Modal */}
{modalVisible && selectedProduct && (
  <TouchableOpacity
    style={styles.modalOverlay}
    activeOpacity={1}
    onPress={closeProductModal}
  >
    <Animated.View
      style={[
        styles.modalContainer,
        {
          transform: [
            {
              translateY: modalAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.85, 1],
              }),
            },
          ],
          opacity: modalAnim,
        },
      ]}
    >
      <TouchableOpacity activeOpacity={1} onPress={() => {}}>

 <ScrollView                                    // <-- add
    showsVerticalScrollIndicator={false}
    bounces={false}
  >
        {/* Close + Bookmark row */}
        <View style={styles.modalTopRow}>
          <TouchableOpacity onPress={closeProductModal} style={styles.modalCloseBtn}>
            <Ionicons name="close" size={22} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalCloseBtn}>
            <Ionicons name="bookmark-outline" size={20} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Zoomed Image */}
        <View style={styles.modalImageContainer}>
          <Image
            source={{ uri: selectedProduct.imageUrl || selectedProduct.image || selectedProduct.subCategory?.imageUrl || "https://via.placeholder.com/200" }}
            style={styles.modalImage}
            resizeMode="contain"
          />
        </View>

        {/* Product Info */}
        <View style={styles.modalInfo}>
          <Text style={styles.modalProductName}>
            {(selectedProduct.productName || selectedProduct.name || selectedProduct.subCategory?.subCategoryName || "Unknown Product").toUpperCase()}
          </Text>

          {selectedProduct.description && (
            <Text style={styles.modalDescription}>{selectedProduct.description}</Text>
          )}

          <Text style={styles.modalMetaText}>
            Min Quantity: {selectedProduct.quantity || selectedProduct.minQuantity || "10kg"}
          </Text>

          <View style={styles.modalDivider} />

          {/* Price Box */}
          <View style={styles.modalPriceBox}>
            {(selectedProduct.discountPercentage || selectedProduct.discount) > 0 && (
              <Text style={styles.modalDiscount}>
                {selectedProduct.discountPercentage || selectedProduct.discount}% OFF
              </Text>
            )}
            <View style={styles.modalPriceRow}>
              <Text style={styles.modalCurrentPrice}>
                ₹{selectedProduct.sellingPrice || selectedProduct.price || 0}/kg
              </Text>
              {(selectedProduct.mrp || 0) > (selectedProduct.sellingPrice || selectedProduct.price || 0) && (
                <Text style={styles.modalMrp}>₹{selectedProduct.mrp}/kg</Text>
              )}
            </View>
            <Text style={styles.modalYesterdayPrice}>
              Price as of yesterday: ₹{selectedProduct.priceAsOfYesterday || selectedProduct.originalPrice || selectedProduct.price || 0}/kg
            </Text>
          </View>
        </View>
        </ScrollView>
      </TouchableOpacity>
    </Animated.View>
  </TouchableOpacity>
)}
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
  browseSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  browseTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151"
  },
  categoriesScroll: {
    marginTop: 16,
    marginBottom: 16,
  },
  categoryItem: {
    paddingVertical: 8,
    paddingHorizontal: 12, // Added padding to center content
    marginRight: 24,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
    alignItems: "center", 
    justifyContent: "flex-end", 
    height: 90, 
    minWidth: 60, 
  },
  categoryIcon: {
    width: 48,
    height: 48,
    marginBottom: 8,
  },
  categoryItemSelected: {
    borderBottomColor: "#4A7A3A",
  },
  categoryText: {
    fontSize: 16,
    color: "#4B5563",
    fontWeight: "600",
  },
  categoryTextSelected: {
    color: "#1F2937",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10, // Increased height to closely match image
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 30, // Can maintain explicit height
    fontSize: 14,
    color: "#374151",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F3F6ED", 
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  subCategorySection: {
    paddingBottom: 4,
  },
  subCategoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 10,
  },
  subCategoriesScroll: {
    flexDirection: "row",
    marginBottom: 8,
  },
  subCategoryPill: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  subCategoryPillSelected: {
    backgroundColor: "#4A7A3A",
  },
  subCategoryPillText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "500",
  },
  subCategoryPillTextSelected: {
    color: "#FFFFFF",
  },
  productGridRow: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  productCardContainer: {
    width: "48%",
    backgroundColor: "#F9FAFB", 
    borderRadius: 16,
    paddingBottom: 16,
  },
  imageContainer: {
    backgroundColor: "transparent",
    borderRadius: 16,
    marginTop: 12,
    marginBottom: 20,
    alignItems: "center",
    paddingVertical: 20,
    position: "relative",
  },
  productImage: {
    width: 100,
    height: 100,
  },
  minQtyBadge: {
    position: "absolute",
    bottom: -16,
    backgroundColor: "#E4E9FF",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  minQtyText: {
    color: "#2C3E50",
    fontSize: 10,
    fontWeight: "600",
  },
  productDetailsInfo: {
    paddingHorizontal: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  yesterdayPrice: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  discountText: {
    fontSize: 12,
    color: "#3B82F6",
    marginBottom: 4,
  },
  priceContainerRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 4,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginRight: 6,
  },
  mrpText: {
    fontSize: 12,
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
    textAlign: "center",
  },
  categoryItemDisabled: {
  opacity: 0.35,
},
categoryIconDisabled: {
  tintColor: "#9CA3AF",
},
categoryTextDisabled: {
  color: "#9CA3AF",
},
modalOverlay: {
  position: "absolute",
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: "rgba(0,0,0,0.45)",
  justifyContent: "center",      
  alignItems: "center",          
  paddingHorizontal: 16,
},
modalContainer: {
  backgroundColor: "#fff",
  borderRadius: 24,              
  paddingBottom: 24,
  width: "100%",                 
  maxHeight: "80%",
},
modalTopRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  paddingHorizontal: 16,
  paddingTop: 16,
  paddingBottom: 8,
},
modalCloseBtn: {
  width: 38,
  height: 38,
  borderRadius: 19,
  backgroundColor: "#F3F4F6",
  alignItems: "center",
  justifyContent: "center",
},
modalImageContainer: {
  backgroundColor: "#F9FAFB",
  marginHorizontal: 16,
  borderRadius: 20,
  alignItems: "center",
  paddingVertical: 20,
},
modalImage: {
  width: 180,
  height: 180,
},
modalInfo: {
  paddingHorizontal: 20,
  paddingTop: 20,
},
modalProductName: {
  fontSize: 20,
  fontWeight: "700",
  color: "#1F2937",
  marginBottom: 6,
},
modalDescription: {
  fontSize: 14,
  color: "#6B7280",
  marginBottom: 8,
},
modalMetaText: {
  fontSize: 13,
  color: "#6B7280",
  marginBottom: 12,
},
modalDivider: {
  height: 1,
  backgroundColor: "#E5E7EB",
  marginBottom: 16,
},
modalPriceBox: {
  backgroundColor: "#F3F6ED",
  borderRadius: 14,
  padding: 16,
},
modalDiscount: {
  fontSize: 14,
  fontWeight: "700",
  color: "#0F9D58",
  marginBottom: 4,
},
modalPriceRow: {
  flexDirection: "row",
  alignItems: "baseline",
  marginBottom: 4,
},
modalCurrentPrice: {
  fontSize: 22,
  fontWeight: "800",
  color: "#1F2937",
  marginRight: 10,
},
modalMrp: {
  fontSize: 14,
  color: "#9CA3AF",
  textDecorationLine: "line-through",
},
modalYesterdayPrice: {
  fontSize: 12,
  color: "#6B7280",
},
});

export default ConnectScreen;