// Home tab
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Image, TextInput, ImageBackground,
  useWindowDimensions,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function RetailerHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';

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

        {/* Header */}
        <View style={[styles.headerWrapper, { paddingTop: insets.top + 8 }]}>
          <Image
            source={require("../../../assets/images/topimg.png")}
            style={styles.topIllustration}
            resizeMode="contain"
          />
          <View style={styles.headerContent}>
            <View>
              <View style={styles.storeBadge}>
                <Text style={styles.storeBadgeText}>Store 1</Text>
              </View>
              <View style={styles.storeNameRow}>
                <Text style={styles.storeName}>Mandavi palace</Text>
                <Ionicons name="chevron-down" size={16} color="#2E7D32" />
              </View>
              <Text style={styles.storeAddress}>udupi, ambagilu 56101</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.greenCircleButton}
                onPress={() => router.push("/(retailer)/notifications")}
              > 
                <Ionicons name="notifications-outline" size={22} color="#2E7D32" />
                <View style={styles.notifDot} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.greenCircleButton}
                onPress={() => router.push("/(retailer)/profile")}
              >
                <Ionicons name="person-outline" size={22} color="#2E7D32" />
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
  notifDot: { position: "absolute", top: 8, right: 8, width: 10, height: 10, borderRadius: 5, backgroundColor: "#2E7D32", borderWidth: 1.5, borderColor: "#C8E6C9" },

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