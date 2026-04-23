import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getCartByShopId, ICartDTO } from '../../../lib/api/cart';
import { storage } from '../../../lib/storage';
import { useFocusEffect, useRouter, useLocalSearchParams } from 'expo-router';


// ─── Types ────────────────────────────────────────────────────────────────────

interface CartItem {
  itemId: string;
  name: string;
  emoji: string;
  quantity: number; 
}


interface SupplierCart {
  supplierId: string;   
  supplierName: string;
  location: string;
  totalItems: number;
  totalQty: number;
  items: CartItem[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_VISIBLE_ITEMS = 10;

/** Default emoji for items that don't have a known mapping */
const DEFAULT_EMOJI = '📦';



// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Maps a CartDTO from the backend into the SupplierCart shape used by the UI.
 * The API returns one cart per shop (not per supplier), so each CartDTO becomes
 * one "supplier" card. supplierId is the cartId, supplierName is derived from
 * the shopId until a dedicated supplier field is available.
 */
const mapCartDTOToSupplierCart = (cart: ICartDTO, index: number): SupplierCart => ({
  supplierId: cart.id,
  // shopName not returned by this endpoint — use index fallback
  supplierName: cart.shopName || `Cart #${index + 1}`,
  location: cart.shopName || '',
  totalItems: cart.items.length,                              // distinct product types
  totalQty: cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0),
  // Expand each item into N emoji boxes (capped at 10) based on quantity
 items: cart.items.map((item,itemIndex) => ({
  itemId: `${item.id}-${itemIndex}`,
  name: item.productName,
  emoji: DEFAULT_EMOJI,
  quantity: item.quantity || 0,
})),
});

// ─── SupplierCartCard Component ───────────────────────────────────────────────

interface SupplierCartCardProps {
  cart: SupplierCart;
  onRemove: (supplierId: string) => void;
}

const SupplierCartCard: React.FC<SupplierCartCardProps> = ({ cart, onRemove }) => {
  const router = useRouter();
  const visibleItems = cart.items.slice(0, MAX_VISIBLE_ITEMS);
  const overflowCount = cart.items.length - MAX_VISIBLE_ITEMS;

  const handleCheckout = () => {
  router.push({
  pathname: '/(retailer)/checkout',
  params: {
    cart: JSON.stringify(cart),
  },
});
};

  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 3,
        overflow: 'hidden',
      }}
    >
      {/* ── Card Header ── */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 14,
          paddingTop: 14,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#F3F4F6',
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#D1FAE5',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 10,
          }}
        >
          <MaterialCommunityIcons name="store" size={20} color="#059669" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827' }}>
            {cart.supplierName}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => onRemove(cart.supplierId)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: '#FEF2F2',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Feather name="x" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* ── Items Grid ── */}
      <View style={{ paddingHorizontal: 14, paddingTop: 12 }}>
        {cart.items.length === 0 ? (
          <Text style={{ fontSize: 13, color: '#9CA3AF', paddingBottom: 8 }}>No items in this cart.</Text>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {visibleItems.map((item, index) => (
              <View
                key={`${item.itemId}-${index}`}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  borderWidth: 1.5,
                  borderColor: '#34D399',
                  backgroundColor: '#F0FDF4',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
              </View>
            ))}
            {overflowCount > 0 && (
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  borderWidth: 1.5,
                  borderColor: '#34D399',
                  backgroundColor: '#D1FAE5',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#065F46' }}>
                  +{overflowCount}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* ── Footer ── */}
      <View
        style={{
          paddingHorizontal: 14,
          paddingTop: 12,
          paddingBottom: 14,
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}
      >
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>Total Shipment Items: </Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#111827' }}>
              {cart.totalItems} items
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>Total Quantity </Text>
            <Text style={{ fontSize: 11, color: '#9CA3AF' }}>(weight): </Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#111827' }}>
              {cart.totalQty} Kg
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleCheckout}
          activeOpacity={0.85}
          style={{
            backgroundColor: '#16A34A',
            borderRadius: 10,
            paddingHorizontal: 18,
            paddingVertical: 10,
            flexDirection: 'row',
            alignItems: 'center',
            columnGap: 6,
            shadowColor: '#16A34A',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.3,
            shadowRadius: 5,
            elevation: 4,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>Checkout</Text>
          <Feather name="arrow-right" size={15} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Empty Cart Component ─────────────────────────────────────────────────────

const EmptyCart: React.FC = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
    <View
      style={{
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
      }}
    >
      <Feather name="shopping-cart" size={36} color="#D1D5DB" />
    </View>
    <Text
      style={{ fontSize: 17, fontWeight: '600', color: '#6B7280', textAlign: 'center', marginBottom: 8 }}
    >
      Looks like your cart's empty.
    </Text>
    <Text style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', lineHeight: 20 }}>
      Browse suppliers and add items you love.
    </Text>
  </View>
);

// ─── Main Cart Screen ─────────────────────────────────────────────────────────

export default function Cart() {
  const router = useRouter();
  const { success } = useLocalSearchParams();
  const [carts, setCarts] = useState<SupplierCart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (success === 'true') {
        setIsLoading(false);
        return;
      }

      let isActive = true;

      const fetchCart = async () => {
        try {
          setIsLoading(true);
          setError(null);

          // Use the same storage helper as the supplier flow so the shopId matches.
          const shopId = (await storage.getItem('shopId')) ?? 'temp-shop-id';

          const data = await getCartByShopId(shopId);
          console.log('Cart API Response:', JSON.stringify(data, null, 2));

          if (isActive) {
            setCarts(data.map(mapCartDTOToSupplierCart));
          }
        } catch (err: any) {
          console.error('Failed to fetch cart:', err);
          if (isActive) {
            setError('Unable to load cart. Please try again.');
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      };

      fetchCart();

      return () => {
        isActive = false;
      };
    }, [success])
  );
  

  const handleRemoveSupplier = (supplierId: string) => {
    // Local removal only — DELETE API integration is out of scope for this task
    setCarts(prev => prev.filter(c => c.supplierId !== supplierId));
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const renderBody = () => {
    if (success === 'true') {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}>
          <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: "#6AA84F", justifyContent: "center", alignItems: "center", marginBottom: 20 }}>
            <Ionicons name="checkmark" size={50} color="#fff" />
          </View>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#2E7D32", textAlign: "center", marginBottom: 10 }}>
            Your order request has been{"\n"}sent to Sunways trading.
          </Text>
          <Text style={{ fontSize: 13, color: "#555", textAlign: "center", marginBottom: 25, lineHeight: 20 }}>
            You will be notified once it is approved. You can also{"\n"}track it in the Orders section
          </Text>
          <TouchableOpacity
            onPress={() => router.setParams({ success: "" })}
            style={{ backgroundColor: "#5A7F41", paddingVertical: 16, paddingHorizontal: 40, borderRadius: 14, minWidth: 250, alignItems: "center" }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Go back to Cart</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (isLoading) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 15, color: '#6B7280' }}>Loading cart…</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Feather name="alert-circle" size={36} color="#EF4444" style={{ marginBottom: 12 }} />
          <Text style={{ fontSize: 15, color: '#EF4444', textAlign: 'center' }}>{error}</Text>
        </View>
      );
    }

    if (carts.length === 0) {
      return <EmptyCart />;
    }

    return (
      <FlatList
        data={carts}
       keyExtractor={(item, index) => `${item.supplierId}-${index}`}
        renderItem={({ item }) => (
          <SupplierCartCard cart={item} onRemove={handleRemoveSupplier} />
        )}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 4,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* ── Header ── */}
      {success !== 'true' && (
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 12,
          backgroundColor: '#F9FAFB',
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#16A34A' }}>Cart</Text>
        {!isLoading && !error && carts.length > 0 && (
          <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
            {carts.length} supplier cart{carts.length > 1 ? 's' : ''} found
          </Text>
        )}
      </View>
)}
      {renderBody()}
    </SafeAreaView>
  );
}