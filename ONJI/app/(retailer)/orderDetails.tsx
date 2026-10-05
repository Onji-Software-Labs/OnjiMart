import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image, // ← make sure this is here
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getOrderDetails } from '@/lib/api/order';
import { localStorage } from '@/lib/localStorage';
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
  imageUri?: string | null; // merged in from local cache, not from API
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
  paymentMethod?: 'CASH_ON_DELIVERY' | 'CREDIT';
  creditStatus?: 'REQUESTED' | 'ACTIVE' | 'REJECTED' | 'CLOSED' | null;
  creditDueDate?: string | null;
};

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function shortId(id: string) {
  if (!id) return '';
  return id.split('-')[0];
}

function formatTime(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

// ---------- Status-driven copy & UI state ----------

type StatusConfig = {
  title: string;
  subtitle: string;
  dotColor: string;
  badgeText: string;
};

function getCreditConfig(status?: string | null) {
  switch (status) {
    case 'ACTIVE':
      return { label: 'Credit approved', color: '#1B8A4B', bg: '#EAF6EE', icon: 'checkmark-circle-outline' as const,
               text: 'Your supplier approved the credit for this order.' };
    case 'REJECTED':
      return { label: 'Credit rejected', color: '#D32F2F', bg: '#FDECEA', icon: 'close-circle-outline' as const,
               text: 'Credit was not accepted. Please pay cash on delivery.' };
    case 'CLOSED':
      return { label: 'Credit paid', color: '#1B8A4B', bg: '#EAF6EE', icon: 'checkmark-done-outline' as const,
               text: 'This credit is fully paid.' };
    default: // REQUESTED
      return { label: 'Credit requested', color: '#F5A524', bg: '#FFF6E5', icon: 'time-outline' as const,
               text: 'Waiting for your supplier to review your credit request.' };
  }
}

function getStatusConfig(status: string): StatusConfig {
  switch (status) {
    case 'NEW':
    case 'PENDING':
      return {
        title: 'Your order is pending',
        subtitle: 'Manage & track outstanding balances for your wholesale partners.',
        dotColor: '#1E88E5',
        badgeText: 'NEW',
      };
    case 'PROCESSING':
      return {
        title: 'Supplier is reviewing your order',
        subtitle: 'Manage & track outstanding balances for your wholesale partners.',
        dotColor: '#F5A524',
        badgeText: 'IN PROGRESS',
      };
    case 'COMPLETED':
    case 'APPROVED':
    case 'DELIVERED':
      return {
        title: 'Your order has been approved!',
        subtitle: 'Manage & track outstanding balances for your wholesale partners.',
        dotColor: '#1B8A4B',
        badgeText: 'APPROVED',
      };
    case 'CANCELLED':
      return {
        title: 'Order cancelled',
        subtitle: 'Manage & track outstanding balances for your wholesale partners.',
        dotColor: '#D32F2F',
        badgeText: 'Cancelled',
      };
    default:
      return {
        title: status,
        subtitle: 'Manage & track outstanding balances for your wholesale partners.',
        dotColor: '#9AA0A6',
        badgeText: status,
      };
  }
}

export default function OrderDetailsScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();

  const [order, setOrder] = useState<OrderAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);

const loadOrder = useCallback(async () => {
  if (!orderId) return;
  try {
    setError(null);
    const data = await getOrderDetails(orderId);

    // merge cached product images (same cache the cart screen writes to)
    let cachedProducts: Record<string, any> = {};
    try {
      const cached = await localStorage.getItem('cachedProducts');
      if (cached) cachedProducts = JSON.parse(cached);
    } catch {}

    const mergedItems = (data.items ?? []).map((item: OrderItemAPI) => ({
      ...item,
      imageUri: cachedProducts[String(item.productId)]?.image?.uri ?? null,
    }));

    setOrder({ ...data, items: mergedItems });
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

  const isApproved = ['COMPLETED', 'APPROVED', 'DELIVERED'].includes(order.status);
  const statusConfig = getStatusConfig(order.status);

// ✅ ici
const isCredit = order.paymentMethod === 'CREDIT';
const creditConfig = getCreditConfig(order.creditStatus);
const paymentLabel = isCredit ? 'Credit' : 'Cash on delivery';
const paymentStatus = isCredit ? creditConfig.label : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() =>     router.navigate({
      pathname: '/(retailer)/(tabs)/cart',
      params: { tab: 'orders' },
    })}
     style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#2E7D32" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
        </View>

        {/* Status card — compact single line */}
        <View style={styles.statusCard}>
          <View style={[styles.statusDot, { backgroundColor: statusConfig.dotColor }]} />
          <View style={styles.statusTextWrap}>
            <Text style={styles.statusTitle}>{statusConfig.title}</Text>
            <Text style={styles.statusSubtitle}>{statusConfig.subtitle}</Text>
          </View>
        </View>

 <View style={styles.groupedCard}>
  {/* Edit address / time slot — only while order can still change */}
  {!isApproved && (
    <TouchableOpacity style={styles.rowCard} activeOpacity={0.7}>
      <Text style={styles.rowCardText} numberOfLines={1}>
        {order.retailerAddress || 'Edit Address or Time slot'}
      </Text>
      <Ionicons name="location-outline" size={20} color="#2E7D32" />
    </TouchableOpacity>
  )}
  {!isApproved && <View style={styles.groupedDivider} />}

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
              <View style={[styles.pendingDot, { backgroundColor: statusConfig.dotColor }]} />
              <Text style={[styles.pendingText, { color: statusConfig.dotColor }]}>
                {statusConfig.badgeText}
              </Text>
            </View>
          </View>

          <View style={styles.infoCol}>
            <View style={styles.infoLabelRow}>
              <Ionicons name="calendar-outline" size={13} color="#0C5217" />
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
                color="#0C5217"
              />  
              <Text style={styles.infoLabel}>Est. Delivery</Text>
            </View >
                <Text style={styles.infoValue}>{formatDate(order.deliveryDate)}</Text>
  
            <Text style={styles.infoSubvalue}>{order.deliveryTimeSlot}</Text>
          </View>
        </View>
{/* Nudge supplier — only while waiting on them */}
{!isApproved && (
  <View style={styles.nudgeCard}>
    <View style={styles.nudgeMessageBadge}>
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
    </View>
)}
</View>


        {/* Rating card — only once approved/delivered */}
        {isApproved && (
          <View style={styles.ratingCard}>
            <Text style={styles.ratingTitle}>How was your order experience?</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={22}
                    color="#F5A524"
                    style={{ marginRight: 4 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.rateButton} activeOpacity={0.8}>
              <Text style={styles.rateButtonText}>Rate now</Text>
            </TouchableOpacity>
          </View>
        )}


        {/* Ordered items */}
        <Text style={styles.sectionTitle}>
          {isApproved ? 'Ordered Items' : 'Requested Ordered Items'}
        </Text>
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
                {/* <Ionicons name="nutrition-outline" size={18} color="#9AA0A6" /> */}
               {/* </View> */}
              {/* <View style={styles.itemImage}> */}
  {item.imageUri ? (
    <Image
      source={{ uri: item.imageUri }}
      style={{ width: '100%', height: '100%', borderRadius: 20 }}
      resizeMode="cover"
    />
  ) : ( 
    <Ionicons name="nutrition-outline" size={18} color="#9AA0A6" />
   )} 
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
<View style={styles.payCard}>
  <Ionicons name="cash-outline" size={22} color="#000" />
  <View style={{ flex: 1 }}>
    <Text style={styles.payMethod}>Payment method: {paymentLabel}</Text>
    {paymentStatus && (
      <Text style={styles.payStatus}>
        {paymentStatus}
        {order.creditStatus === 'ACTIVE' && order.creditDueDate
          ? ` · Due ${formatDate(order.creditDueDate)}`
          : ''}
      </Text>
    )}
  </View>
</View>
        {/* Order summary — subtotal / tax / grand total */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              ₹{(order.subtotal ?? 0).toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (GST 5%)</Text>
            <Text style={styles.summaryValue}>
              ₹{(order.taxAmount ?? 0).toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryRowTotal]}>
            <Text style={styles.summaryLabelTotal}>Grand Total</Text>
            <Text style={styles.summaryValueTotal}>
              ₹{(order.grandTotal ?? 0).toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

{/* 
{isCredit && (
  <View style={[styles.creditCard, { backgroundColor: creditConfig.bg }]}>
    <Ionicons name={creditConfig.icon} size={22} color={creditConfig.color} />
    <View style={{ flex: 1 }}>
      <Text style={[styles.creditTitle, { color: creditConfig.color }]}>
        {creditConfig.label}
      </Text>
      <Text style={styles.creditText}>{creditConfig.text}</Text>
      {order.creditStatus === 'ACTIVE' && order.creditDueDate && (
        <Text style={styles.creditText}>
          Due date: {formatDate(order.creditDueDate)}
        </Text>
      )}
    </View>
  </View>
)} */}

        {/* Bottom actions */}
        {isApproved && (
          <View style={styles.approvedActionsRow}>
    <TouchableOpacity
  style={styles.orderMoreButton}
  activeOpacity={0.8}
  onPress={() =>
    router.navigate({
      pathname: '/(retailer)/orderSupplierScreen', // ← replace with the real path
      params: {
        supplierId: order.supplierId,
        businessId: order.shopId, // ← confirm this mapping is correct
        supplierName: order.supplierName,
      },
    })
  }
>
  <Text style={styles.orderMoreButtonText}>Order More</Text>
</TouchableOpacity>
            <TouchableOpacity style={styles.viewInvoiceButton} activeOpacity={0.8}>
              <Text style={styles.viewInvoiceButtonText}>View Invoice</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const GREEN = '#1B8A4B';
const GREEN_BG = '#EAF6EE';

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F6F6F6' },
  centered: { justifyContent: 'center', alignItems: 'center' },
deliveryRow: {
  flexDirection: 'row',
  alignItems: 'center',
},
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 180,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 15,
    paddingTop: 20,
    gap: 6,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#2A6B2D' },

  backBtn: {
    padding: 9,
  },

  // Compact single-line status card
  statusCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F6F6F6',
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 5,
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
    marginTop: 6,
  },
  statusTextWrap: {
    flex: 1,
  },
  statusSubtitle: {
    fontSize: 12,
    color: '#204724',
    lineHeight: 18,
    marginTop: 2,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#204724',
  },

  // rowCard: {
  //   backgroundColor: '#FFFFFF',
  //   borderRadius: 12,
  //   paddingVertical: 14,
  //   paddingHorizontal: 16,
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'space-between',
  //   marginLeft: 20,
  //   marginRight: 20,
  //   marginBottom: 12,
  // },
  rowCardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2A2A2A',
    flex: 1,
    marginRight: 8,
  },
  // infoRow: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   backgroundColor: '#FFFFFF',
  //   borderRadius: 12,
  //   padding: 14,
  //   marginBottom: 12,
  // },
  infoCol: {
    flex: 1,
    alignItems: 'center',
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
    fontSize: 10,
    color: '#002204',
    marginTop: 2,
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  pendingText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  // nudgeCard: {
  //   backgroundColor: GREEN_BG,
  //   borderRadius: 14,
  //   paddingVertical: 12,
  //   paddingHorizontal: 14,
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   marginBottom: 20,
  // },
  nudgeText: {
    flex: 1,
    fontSize: 11,
    color: '#000000',
    // fontWeight: '500',
    paddingEnd: 15,
  },
  nudgeButton: {
    backgroundColor: GREEN,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  nudgeButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 12,
  },
  ratingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#2A2A2A',
    marginBottom: 10,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  rateButton: {
    backgroundColor: GREEN,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  rateButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#41493E',
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
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryRowTotal: {
    borderTopWidth: 1,
    borderTopColor: '#F0F1F3',
    marginTop: 6,
    paddingTop: 10,
  },
  summaryLabel: {
    fontSize: 12.5,
    color: '#8A8A8A',
  },
  summaryValue: {
    fontSize: 12.5,
    color: '#2A2A2A',
    fontWeight: '600',
  },
  summaryLabelTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#181D18',
  },
  summaryValueTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: GREEN,
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
  approvedActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  orderMoreButton: {
    flex: 1,
    backgroundColor: GREEN,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  orderMoreButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13.5,
  },
  viewInvoiceButton: {
    flex: 1,
    backgroundColor: GREEN_BG,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  viewInvoiceButtonText: {
    color: GREEN,
    fontWeight: '700',
    fontSize: 13.5,
  },

  groupedCard: {
  backgroundColor: '#FFFFFF',
  borderRadius: 14,
  marginBottom: 12,
  overflow: 'hidden',
},
groupedDivider: {
  height: 1,
  backgroundColor: '#F0F1F3',
  marginHorizontal: 16,
},

rowCard: {
  backgroundColor: 'transparent',
  borderRadius: 0,
  paddingVertical: 14,
  paddingHorizontal: 16,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginLeft: 0,
  marginRight: 0,
  marginBottom: 0,
},

infoRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  backgroundColor: 'transparent',
  borderRadius: 0,
  padding: 14,
  marginBottom: 0,
},

nudgeCard: {
  backgroundColor: 'transparent',
  borderRadius: 0,
  paddingVertical: 12,
  paddingHorizontal: 14,
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 0,
},
nudgeMessageBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: GREEN_BG,
  borderRadius: 8,
  paddingVertical: 8,
  paddingHorizontal: 10,
  flex: 1,
  marginRight: 10,
},
creditCard: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: 10,
  borderRadius: 12,
  padding: 12,
  marginBottom: 14,
},
creditTitle: { fontSize: 13.5, fontWeight: '700' },
creditText: { fontSize: 11.5, color: '#3D5B47', marginTop: 2, lineHeight: 16 },
payCard: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  backgroundColor: GREEN_BG,
  borderRadius: 14,
  padding: 14,
  marginBottom: 16,
},
payMethod: { fontSize: 14, fontWeight: '700', color: '#000' },
payStatus: { fontSize: 12, color: '#000', marginTop: 2 },
});