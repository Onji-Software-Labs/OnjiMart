// Home tab
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Image, TextInput, ImageBackground,
  useWindowDimensions,
  Platform,
  Alert,
  Modal,
  ActivityIndicator,
  StatusBar as RNStatusBar
} from "react-native";
import { useRouter } from "expo-router";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useCallback, useEffect } from "react";
import { useFocusEffect } from "expo-router";
import { secureStorage } from '@/lib/secureStorage';
import axiosInstance from '@/lib/api/axiosConfig';
import { Shop } from '@/constants/StorageKeys'; // adjust path to your project structure

export default function RetailerHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';

  const [notificationCount, setNotificationCount] = useState(0);
// Add near your other state
const [shops, setShops] = useState<Shop[]>([]);
// State — note selectedShop holds a full Shop object, not just a string
const [isShopModalVisible, setIsShopModalVisible] = useState(false);
const [selectedShop, setSelectedShop] = useState<Shop | null>(shops[0] ?? null);

// Derive the shop being displayed
const currentShop = selectedShop ?? shops[0];
useEffect(() => {
  const loadShops = async () => {
    const storedShops = await secureStorage.getItem('shopsList');
    const storedShopId = await secureStorage.getItem('shopId');
    if (storedShops) {
      const parsedShops: Shop[] = JSON.parse(storedShops);
      setShops(parsedShops);
      const current = parsedShops.find((s) => s.id === storedShopId) || parsedShops[0];
      setSelectedShop(current);
    }
  };
  loadShops();
}, []);

const handleSelectShop = async (shop: Shop) => {
  setSelectedShop(shop);
  await secureStorage.setItem('shopId', shop.id);
  setIsShopModalVisible(false);
  // Optionally trigger a refetch of dashboard data tied to shopId here
};
  useFocusEffect(
    useCallback(() => {
      const fetchNotificationCount = async () => {
        try {
          const retailerId = await secureStorage.getItem("userId");
          if (!retailerId) return;

          const response = await axiosInstance.get(
            `/api/connections/retailer/${retailerId}/requests`
          );

          setNotificationCount(response.data ? response.data.length : 0);
        } catch (error) {
          console.error("Error fetching notification count:", error);
        }
      };

      fetchNotificationCount();
    }, [])
  );

    // dynamic measurements
  const horizontalPadding = 16;
  const availableWidth = width - horizontalPadding * 2;
  const tileSize = Math.min((availableWidth - 24) / 4, 60);
  
    // Navigation
    const handleTilePress = (tileLabel: string) => {
      try {
        switch (tileLabel) {
          case 'My Suppliers':
            router.push('/supplier');
            break;
          case 'Credit':
            router.push('/invoice');
            break;
          case 'Orders':
            router.push('/cart');
            break;
          case 'Saved Items':
            break;
          default:
            console.log(`Navigation not implemented for: ${tileLabel}`);
            break;
        }
      } catch (error) {
        console.error('Navigation error:', error);
        Alert.alert('Navigation Error', 'Unable to navigate to the requested screen.');
      }
    };
  
  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }} 
      >

 {/* HEADER */}
<View
  style={{
    paddingHorizontal: horizontalPadding,
    paddingTop: Platform.OS === 'android'
      ? (RNStatusBar.currentHeight ?? 24) + 8
      : isWeb ? 20 : 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    zIndex: 10,
    position: 'relative'
  }}>

  {/* Decorative Image */}
  <View
    pointerEvents="none"
    style={{
      position: 'absolute',
      top: -10,
      right: 0,
      width: 180,
      height: 180,
      opacity: 0.6,
      zIndex: 1
    }}>
    <Image
      source={require('../../../assets/images/topimg.png')}
      style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
    />
  </View>

  {/* Shop & Icons */}
  <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', zIndex: 2 }}>
<View style={{ flex: 1 }}>
  <View style={{
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 4,
  }}>
    <Text style={{ fontSize: 11, fontWeight: '600', color: '#2E7D32' }}>
      {shops.length === 0 ? 'Store' : (currentShop?.name ?? 'Store 1')}

    </Text>
  </View>

  <TouchableOpacity
    onPress={() => shops.length > 0 && setIsShopModalVisible(!isShopModalVisible)}
    disabled={shops.length === 0}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4
    }}>
    <Text style={{
      fontSize: isWeb ? 17 : 17,
      fontWeight: '700',
      color: '#1F2937',
      marginRight: 9
    }}>
      {shops.length === 0 ? 'No shop' : (currentShop?.name ?? 'Select a shop')}
    </Text>
    {shops.length > 0 && (
      <Ionicons
        name={isShopModalVisible ? "chevron-up" : "chevron-down"}
        size={20}
        color="#6B7280"
      />
    )}
  </TouchableOpacity>

  {shops.length > 0 && (
    <Text style={{
      fontSize: isWeb ? 14 : 13,
      color: '#6B7280',
      marginBottom: 2
    }}>
      {[currentShop?.city, currentShop?.location, currentShop?.pincode]
        .filter(Boolean)
        .join(', ')}
    </Text>
  )}

  {/* Shop Dropdown */}
  {isShopModalVisible && shops.length > 0 && (
    <View style={{
      position: 'absolute',
      top: 60,
      left: 0,
      right: 0,
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
      zIndex: 20
    }}>
      {shops.map((shop, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => {
            setSelectedShop(shop);
            setIsShopModalVisible(false);
            handleSelectShop(shop);
          }}
          style={{
            padding: 16,
            borderBottomWidth: index < shops.length - 1 ? 1 : 0,
            borderBottomColor: '#F3F4F6'
          }}>
          <Text style={{
            fontSize: 16,
            fontWeight: shop.name === currentShop?.name ? '600' : '400',
            color: shop.name === currentShop?.name ? '#059669' : '#1F2937'
          }}>
            {shop.name}
          </Text>
          <Text style={{
            fontSize: isWeb ? 14 : 13,
            color: '#6B7280',
            marginTop: 4
          }}>
            {[shop?.city, shop?.location, shop?.pincode].filter(Boolean).join(', ')}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )}
</View>

    {/* Icons */}
    <View style={{ flexDirection: 'row', marginLeft: 12, zIndex: 20, elevation: 10 }}>
      <TouchableOpacity
        onPress={() => router.push('/(retailer)/notifications' as any)}
        style={{
          width: isWeb ? 44 : 40,
          height: isWeb ? 44 : 40,
          borderRadius: isWeb ? 22 : 20,
          backgroundColor: notificationCount > 0 ? '#E8F5E9' : '#F3F4F6',
          borderWidth: 1.5,
          borderColor: notificationCount > 0 ? '#2E7D32' : '#D1D5DB',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 8,
        }}>
        <Ionicons name="notifications-outline" size={isWeb ? 24 : 20} color={notificationCount > 0 ? '#2E7D32' : '#9CA3AF'} />
        {notificationCount > 0 && (
          <View style={{
            position: 'absolute',
            top: -4,
            right: -4,
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: '#2E7D32',
            borderWidth: 1.5,
            borderColor: '#FFFFFF',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 4,
          }}>
            <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700' }}>{notificationCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/(retailer)/profile' as any)}
        style={{
          width: isWeb ? 44 : 40,
          height: isWeb ? 44 : 40,
          borderRadius: isWeb ? 22 : 20,
          backgroundColor: '#E8F5E9',
          borderWidth: 1.5,
          borderColor: '#2E7D32',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        <Ionicons name="person-outline" size={isWeb ? 24 : 20} color="#2E7D32" />
      </TouchableOpacity>
    </View>
  </View>
</View>

        {/* Search */}
        <View style={styles.searchBarWrapper}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color="#999" />
            <TextInput
              placeholder='Search "Random kaka"'
              placeholderTextColor="#999"
              style={styles.searchInput}
            />
          </View>
        </View>

        {/* Banner */}
        <ImageBackground
          source={require("../../../assets/images/homebg.jpg")}
          style={styles.bannerSection}
          resizeMode="cover"
        >
          <View style={styles.bannerTitleRow}>
            <Text style={styles.bannerTitle}>Welcome to your Vendor Hub</Text>
            <Text style={{ fontSize: 20 }}>🧍</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            <View style={styles.bannerCardSmall}>
              <Image source={require("../../../assets/images/farms.jpg")} style={styles.bannerImage} resizeMode="cover" />
              <View style={styles.bannerOverlaySmall}>
                <Text style={styles.bannerCardLabel}>local farms</Text>
              </View>
            </View>
            <View style={styles.bannerCardMain}>
              <Image source={require("../../../assets/images/vegi.jpg")} style={styles.bannerImage} resizeMode="cover" />
              <View style={styles.bannerOverlayMain}>
                <Text style={styles.bannerHeading}>Fresh from Farm to You</Text>
                <Text style={styles.bannerSubtext}>Sourced daily from trusted local farms</Text>
              </View>
            </View>
            <View style={styles.bannerCardSmall}>
              <Image source={require("../../../assets/images/apple.jpg")} style={styles.bannerImage} resizeMode="cover" />
              <View style={styles.bannerOverlaySmall}>
                <Text style={styles.bannerCardLabel}>Fresh fr...</Text>
                <Text style={styles.bannerCardSubLabel}>Sourced...</Text>
              </View>
            </View>
          </ScrollView>
          <TouchableOpacity style={styles.shopButton}>
            <Text style={styles.shopButtonText}>Shop for fresh produce</Text>
          </TouchableOpacity>
          <View style={styles.dotsRow}>
            <View style={[styles.dot, { backgroundColor: "#888", width: 6, height: 6, borderRadius: 3 }]} />
            <View style={[styles.dot, { backgroundColor: "#1A1A1A" }]} />
            <View style={[styles.dot, { backgroundColor: "#888", width: 6, height: 6, borderRadius: 3 }]} />
          </View>
        </ImageBackground>

        {/* MANAGE STORE SECTION */}
        <View style={{ paddingHorizontal: horizontalPadding, marginBottom: 24 }}>
          <Text style={{
            fontSize: isWeb ? 20 : 18,
            fontWeight: '600',
            color: '#1F2937',
            marginBottom: 16
          }}>
            Manage your store
          </Text>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}>
            {[
              {
                label: 'My Suppliers',
                value: '20',
                bg: '#DCFCE7',
                icon: <MaterialCommunityIcons name="account-group" size={isWeb ? 22 : 20} color="#10B981" />
              },
              {
                label: 'Orders',
                value: '4 active orders',
                bg: '#E9D5FF',
                icon: <Feather name="shopping-bag" size={isWeb ? 22 : 20} color="#7C3AED" />
              },
              {
                label: 'Credit',
                value: '3 active credits',
                bg: '#FEF3C7',
                icon: <MaterialCommunityIcons name="credit-card-outline" size={isWeb ? 22 : 20} color="#CA8A04" />
              },
              {
                label: 'Saved Items',
                value: '',
                bg: '#FECACA',
                icon: <MaterialCommunityIcons name="fruit-grapes" size={isWeb ? 22 : 20} color="#E11D48" />
              },
            ].map((tile, index) => (
              <View key={index} style={{ alignItems: 'center', flex: 1 }}>
                <TouchableOpacity
                  style={{
                    width: tileSize,
                    height: tileSize,
                    borderRadius: 16,
                    backgroundColor: tile.bg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3
                  }}
                  activeOpacity={0.7}
                  onPress={() => handleTilePress(tile.label)}>
                  {tile.icon}
                </TouchableOpacity>
                <Text style={{
                  fontSize: isWeb ? 11 : 10,
                  color: '#6B7280',
                  textAlign: 'center',
                  marginBottom: 2
                }}>
                  {tile.label}
                </Text>
                {tile.value ? (
                  <Text style={{
                    fontSize: isWeb ? 13 : 12,
                    fontWeight: '600',
                    color: '#1F2937',
                    textAlign: 'center'
                  }}>
                    {tile.value}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        </View>

        {/* Discover Suppliers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Discover suppliers</Text>
          <View style={styles.supplierGrid}>
            <View style={styles.supplierCard}>
              <View style={styles.avatarWrapper}>
                <Image source={require("../../../assets/images/3d_avatar_1.png")} style={styles.supplierAvatar} />
              </View>
              <TouchableOpacity style={styles.heartIcon}>
                <Ionicons name="heart-outline" size={18} color="#999" />
              </TouchableOpacity>
              <Text style={styles.supplierName}>Sunway trading</Text>
              <Text style={styles.supplierSub}>Random kaka</Text>
              <Text style={styles.supplierDistance}>3 kms away, Mangalore</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={13} color="#FFC107" />
                <Text style={styles.ratingText}>4.5(6)</Text>
              </View>
            </View>
            <View style={styles.supplierCard}>
              <View style={styles.avatarWrapper}>
                <Image source={require("../../../assets/images/3d_avatar_1.png")} style={styles.supplierAvatar} />
              </View>
              <TouchableOpacity style={styles.heartIcon}>
                <Ionicons name="heart-outline" size={18} color="#999" />
              </TouchableOpacity>
              <Text style={styles.supplierName}>Sunway trading</Text>
              <Text style={styles.supplierSub}>Random kaka</Text>
              <Text style={styles.supplierDistance}>3 kms away, Mangalore</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={13} color="#FFC107" />
                <Text style={styles.ratingText}>4.5(6)</Text>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },

  /* Header */
  headerWrapper: { backgroundColor: "#FFFFFF", position: "relative", overflow: "hidden", paddingBottom: 16 },
  topIllustration: { position: "absolute", right: 60, bottom: 0, width: 180, height: 130 },
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  storeBadge: { backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, alignSelf: "flex-start", marginBottom: 3, borderWidth: 1, borderColor: "#C8E6C9" },
  storeBadgeText: { fontSize: 11, color: "#555", fontWeight: "500" },
  storeNameRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  storeName: { fontSize: 20, fontWeight: "700", color: "#1A1A1A" },
  storeAddress: { fontSize: 12, color: "#555", marginTop: 1 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  greenCircleButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#C8E6C9", justifyContent: "center", alignItems: "center", position: "relative" },

  /* Search */
  searchBarWrapper: { backgroundColor: "#fff", paddingHorizontal: 16, paddingVertical: 10 },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#F5F5F5", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11, gap: 8 },
  searchInput: { flex: 1, fontSize: 14, color: "#333" },

  /* Banner */
  bannerSection: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, width: "100%" },
  bannerTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  bannerTitle: { fontSize: 20, fontWeight: "800", color: "#1B5E20" },
  bannerCardSmall: { width: 85, height: 200, borderRadius: 12, overflow: "hidden" },
  bannerCardMain: { width: 230, height: 200, borderRadius: 12, overflow: "hidden" },
  bannerImage: { width: "100%", height: "100%" },
  bannerOverlaySmall: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 8, backgroundColor: "rgba(0,0,0,0.55)" },
  bannerOverlayMain: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 14, backgroundColor: "rgba(0,0,0,0.35)" },
  bannerCardLabel: { color: "#fff", fontSize: 11, fontWeight: "600" },
  bannerCardSubLabel: { color: "#eee", fontSize: 9 },
  bannerHeading: { fontSize: 16, fontWeight: "700", color: "#fff" },
  bannerSubtext: { fontSize: 12, color: "#eee", marginTop: 2 },
  shopButton: { backgroundColor: "#2E7D32", alignSelf: "center", paddingHorizontal: 28, paddingVertical: 12, borderRadius: 25, marginTop: 12 },
  shopButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  dotsRow: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 10, marginBottom: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },

  /* Manage Store */
  section: { marginHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1A1A1A", marginBottom: 12 },
  storeRow4: { flexDirection: "row", justifyContent: "space-between" },
  storeItem4: { alignItems: "flex-start", flex: 1 },
  storeIconBox: { width: 52, height: 52, borderRadius: 14, justifyContent: "center", alignItems: "center", marginBottom: 6, position: "relative" },
  itemBadge: { position: "absolute", top: 6, right: 6, width: 9, height: 9, borderRadius: 5, backgroundColor: "#2E7D32" },
  storeItemLabel: { fontSize: 12, fontWeight: "600", color: "#1A1A1A" },
  storeItemCount: { fontSize: 10, color: "#666", marginTop: 1 },

  /* Discover Suppliers */
  supplierGrid: { flexDirection: "row", gap: 12, marginBottom: 30, marginTop: 40 },
  supplierCard: { flex: 1, backgroundColor: "#fff", borderRadius: 12, padding: 12, paddingTop: 46, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, position: "relative" },
  avatarWrapper: { position: "absolute", top: -36, left: 12 },
  supplierAvatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: "#fff" },
  heartIcon: { position: "absolute", top: 10, right: 10 },
  supplierName: { fontSize: 14, fontWeight: "700", color: "#1A1A1A" },
  supplierSub: { fontSize: 12, color: "#666", marginTop: 2 },
  supplierDistance: { fontSize: 11, color: "#999", marginTop: 2 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 4 },
  ratingText: { fontSize: 12, color: "#333" },
});
// Added by Me