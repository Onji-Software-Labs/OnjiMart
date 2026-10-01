import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getOrderDetails } from '@/lib/api/order';

// ---------- Types matching the API response ----------

type OrderItemAPI = {
  id: string;
  productId: string;
  productName: string;
  requestedQuantity: number;
  fulfilledQuantity: number;
  unitPrice: number;
  totalPrice: number;
  status: string;
  editable: boolean;
  availableQuantity: number;
  edited: boolean;
  fulfilled: boolean;
  backordered: boolean;
};

type OrderAPI = {
  id: string;
  supplierId: string;
  supplierName: string;
  shopId: string;
  shopName: string;
  retailerId: string;
  retailerName: string;
  orderDate: string;
  deliveryDate: string;
  deliveryTimeSlot: string;
  status: string;
  items: OrderItemAPI[];
  supplierPhoneNumber: string;
  retailerPhoneNumber: string;
  retailerAddress: string;
  totalOrderItems: number;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  completed: boolean;
};

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function shortId(id: string) {
  if (!id) return '';
  return id.split('-')[0]; // prend seulement le premier segment avant le premier tiret
}
function formatTime(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function statusTitle(status: string) {
  switch (status) {
    case 'NEW':
    case 'PENDING':
      return 'Your order is pending';
    case 'CONFIRMED':
      return 'Your order is confirmed';
    case 'DELIVERED':
      return 'Your order has been delivered';
    case 'CANCELLED':
      return 'Your order was cancelled';
    default:
      return 'Your order status';
  }
}

export default function OrderDetailsScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();

  const [order, setOrder] = useState<OrderAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      setError(null);
      const data = await getOrderDetails(orderId);
      setOrder(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load order.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <Text style={{ color: '#41493E', marginBottom: 12 }}>
          {error ?? 'Order not found.'}
        </Text>
        <TouchableOpacity onPress={loadOrder}>
          <Text style={{ color: '#2E7D32', fontWeight: '700' }}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#2E7D32" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
        </View>

        {/* Status card */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>{statusTitle(order.status)}</Text>
          <Text style={styles.statusSubtitle}>
            {order.supplierName} · {order.totalOrderItems} item
            {order.totalOrderItems !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Edit address / time slot */}
        <TouchableOpacity style={styles.rowCard} activeOpacity={0.7}>
          <Text style={styles.rowCardText} numberOfLines={1}>
            {order.retailerAddress || 'Edit Address or Time slot'}
          </Text>
          <Ionicons name="location-outline" size={20} color="#2E7D32" />
        </TouchableOpacity>

        {/* Transaction info */}
        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <View style={styles.infoLabelRow}>
              <MaterialCommunityIcons name="pound" size={13} color="#8A8A8A" />
              <Text style={styles.infoLabel}>Transaction ID</Text>
            </View>
            <Text style={styles.infoValue} numberOfLines={1}>
              #{shortId(order.id)}
            </Text>
            <View style={styles.pendingRow}>
              <View style={styles.pendingDot} />
              <Text style={styles.pendingText}>{order.status}</Text>
            </View>
          </View>

          <View style={styles.infoCol}>
            <View style={styles.infoLabelRow}>
              <Ionicons name="calendar-outline" size={13} color="#8A8A8A" />
              <Text style={styles.infoLabel}>Order Placed</Text>
            </View>
            <Text style={styles.infoValue}>{formatDate(order.orderDate)}</Text>
            <Text style={styles.infoSubvalue}>{formatTime(order.orderDate)}</Text>
          </View>

          <View style={styles.infoCol}>
            <View style={styles.infoLabelRow}>
              <MaterialCommunityIcons
                name="truck-delivery-outline"
                size={13}
                color="#8A8A8A"
              />
              <Text style={styles.infoLabel}>Est. Delivery</Text>
            </View>
            <Text style={styles.infoValue}>{formatDate(order.deliveryDate)}</Text>
            <Text style={styles.infoSubvalue}>{order.deliveryTimeSlot}</Text>
          </View>
        </View>

        {/* Nudge supplier */}
        <View style={styles.nudgeCard}>
          <Ionicons
            name="location-outline"
            size={18}
            color="#1B8A4B"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.nudgeText}>
            Remind {order.supplierName || 'the supplier'} to check order
          </Text>
          <TouchableOpacity style={styles.nudgeButton} activeOpacity={0.8}>
            <Text style={styles.nudgeButtonText}>Nudge</Text>
          </TouchableOpacity>
        </View>
        {/* Ordered items */}
        <Text style={styles.sectionTitle}>Requested Ordered Items</Text>
        <View style={styles.itemsCard}>
          {order.items.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.itemRow,
                index !== order.items.length - 1 && styles.itemRowDivider,
              ]}
            >
              <View style={styles.itemImage}>
                <Ionicons name="nutrition-outline" size={18} color="#9AA0A6" />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.productName}</Text>
                <Text style={styles.itemMeta}>
                  {item.requestedQuantity} x ₹{item.unitPrice}/unit
                  {item.backordered ? '  ·  backordered' : ''}
                </Text>
              </View>
              <Text style={styles.itemPrice}>
                ₹{item.totalPrice.toLocaleString('en-IN')}
              </Text>
            </View>
          ))}
        </View>

        {/* Payment note */}
        <View style={styles.paymentNote}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color="#1B8A4B"
            style={{ marginRight: 6, marginTop: 1 }}
          />
          <Text style={styles.paymentNoteText}>
            Mode of Payment Requested. Pay Now if Online, Option Available
            Once Order Has Been Approved
          </Text>
        </View>

        {/* Pay now (disabled until approved) */}
        <TouchableOpacity style={styles.payButton} disabled={!order.completed}>
          <Text style={styles.payButtonText}>Pay now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const GREEN = '#1B8A4B';
const GREEN_BG = '#EAF6EE';

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F6F6F6' },
  centered: { justifyContent: 'center', alignItems: 'center' },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 180,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#2A6B2D' },

  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 5,
    paddingTop: 5,
    marginTop: 15,
  },
  statusCard: {
    backgroundColor: '#F6F6F6',
    borderRadius: 16,
    padding: 16,
    marginLeft: 20,
    marginRight: 20,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#204724',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 12,
    color: '#204724',
    lineHeight: 18,
  },
  rowCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 12,
  },
  rowCardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2A2A2A',
    flex: 1,
    marginRight: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  infoCol: {
    flex: 1,
  },
  infoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 10,
    color: '#41493E',
    marginLeft: 4,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#181D18',
    marginBottom: 2,
  },
  infoSubvalue: {
    fontSize: 11.5,
    color: '#9AA0A6',
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F5A524',
    marginRight: 4,
  },
  pendingText: {
    fontSize: 11.5,
    color: '#F5A524',
    fontWeight: '600',
  },
  nudgeCard: {
    backgroundColor: GREEN_BG,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  nudgeText: {
    flex: 1,
    fontSize: 12.5,
    color: '#3D5B47',
    fontWeight: '500',
  },
  nudgeButton: {
    backgroundColor: GREEN,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  nudgeButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12.5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2A2A2A',
    marginBottom: 10,
  },
  itemsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  itemRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F3',
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#F0F1F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#2A2A2A',
    marginBottom: 2,
  },
  itemMeta: {
    fontSize: 11.5,
    color: '#9AA0A6',
  },
  itemPrice: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#2A2A2A',
  },
  paymentNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: GREEN_BG,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  paymentNoteText: {
    flex: 1,
    fontSize: 11.5,
    color: '#3D5B47',
    lineHeight: 16,
  },
  payButton: {
    backgroundColor: '#E3E5E8',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#9AA0A6',
    fontWeight: '700',
    fontSize: 14,
  },
});