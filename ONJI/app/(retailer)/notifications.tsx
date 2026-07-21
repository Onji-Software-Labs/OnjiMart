import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons'; 
import { secureStorage } from '@/lib/secureStorage';
import axiosInstance from '../../lib/api/axiosConfig';

// ─── Color Palette ───────────────────────────────────────────────────
const COLORS = {
  primary: '#2E7D32',
  primaryLight: '#E8F5E9',
  primaryMid: '#A5D6A7',
  primaryDark: '#1B5E20',
  white: '#FFFFFF',
  bg: '#F8FAF8',
  cardBg: '#FFFFFF',
  textPrimary: '#1A1D1F',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  border: '#E8ECE8',
  borderLight: '#F0F4F0',
  divider: '#F3F4F6',
  danger: '#EF4444',
  dangerLight: '#FEF2F2',
  shadow: '#0A3D0A',
  connectedBg: '#F0FDF4',
  connectedBorder: '#86EFAC',
};

// ─── Helper: Format Time ─────────────────────────────────────────────
const formatTime = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
  } catch {
    return '';
  }
};

// ─── Helper: Check if date is today ──────────────────────────────────
const isToday = (dateStr: string) => {
  try {
    return new Date(dateStr).toDateString() === new Date().toDateString();
  } catch {
    return false;
  }
};

// ─── Order Notification Item ─────────────────────────────────────────
const OrderNotificationItem = ({ 
  message, 
  timeString, 
  onPress 
}: {
  message: string;
  timeString: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity 
    onPress={onPress}
    activeOpacity={0.7}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 4,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.borderLight,
    }}
  >
    {/* Icon Container */}
    <View style={{
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: COLORS.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: COLORS.border,
    }}>
      <MaterialCommunityIcons name="account-group-outline" size={22} color={COLORS.primary} />
    </View>

    {/* Content */}
    <View style={{ flex: 1, marginLeft: 12 }}>
      <Text style={{ 
        fontSize: 13, 
        color: COLORS.textSecondary, 
        lineHeight: 19, 
        fontWeight: '400' 
      }}>
        {message || 'Notification details.'}
      </Text>
      <Text style={{ 
        fontSize: 11, 
        color: COLORS.textMuted, 
        marginTop: 4, 
        textAlign: 'right' 
      }}>
        {timeString}
      </Text>
    </View>
  </TouchableOpacity>
);

// ─── Section Header ──────────────────────────────────────────────────
const SectionHeader = ({ title, showViewAll = false, onViewAll, viewAllLabel = 'View all' }: { 
  title: string; 
  showViewAll?: boolean; 
  onViewAll?: () => void;
  viewAllLabel?: string;
}) => (
  <View style={{ 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  }}>
    <Text style={{ 
      fontSize: 17, 
      fontWeight: '700', 
      color: COLORS.textPrimary,
      letterSpacing: -0.3,
    }}>
      {title}
    </Text>
    {showViewAll && (
      <TouchableOpacity 
        onPress={onViewAll}
        style={{ flexDirection: 'row', alignItems: 'center' }}
        activeOpacity={0.7}
      >
        <Text style={{ 
          color: COLORS.primary, 
          fontWeight: '600', 
          fontSize: 13,
          marginRight: 2,
        }}>
          {viewAllLabel}
        </Text>
        <Feather name={viewAllLabel === 'Show less' ? 'chevron-up' : 'chevron-right'} size={16} color={COLORS.primary} />
      </TouchableOpacity>
    )}
  </View>
);

// ─── Connection Request Card (Pending) ───────────────────────────────
const PendingRequestCard = ({ 
  request, 
  supplierName, 
  formattedTime, 
  onConfirm, 
  onDelete 
}: {
  request: any;
  supplierName: string;
  formattedTime: string;
  onConfirm: () => void;
  onDelete: () => void;
}) => (
  <View style={{
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  }}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {/* Avatar */}
      <View style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: COLORS.primaryLight,
        overflow: 'hidden',
      }}>
        <Image
          source={require('../../assets/images/3davatar.png')}
          style={{ width: 44, height: 44, borderRadius: 22 }}
        />
      </View>

      {/* Text */}
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={{ fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 }}>
          <Text style={{ fontWeight: '700', color: COLORS.textPrimary }}>{supplierName}</Text>
          {' '}wants to connect with you
        </Text>
      </View>
    </View>

    {/* Action Buttons */}
    <View style={{ 
      flexDirection: 'row', 
      marginTop: 14, 
      marginLeft: 60, 
      gap: 10 
    }}>
      <TouchableOpacity 
        onPress={onConfirm}
        activeOpacity={0.8}
        style={{
          backgroundColor: COLORS.primary,
          paddingVertical: 10,
          borderRadius: 10,
          flex: 1,
          alignItems: 'center',
          shadowColor: COLORS.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Text style={{ color: COLORS.white, fontWeight: '700', fontSize: 13 }}>Confirm</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={onDelete}
        activeOpacity={0.8}
        style={{
          borderWidth: 1.5,
          borderColor: '#D1D5DB',
          backgroundColor: '#FAFAFA',
          paddingVertical: 10,
          borderRadius: 10,
          flex: 1,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#6B7280', fontWeight: '600', fontSize: 13 }}>Delete</Text>
      </TouchableOpacity>
    </View>

    {/* Time */}
    <Text style={{ 
      textAlign: 'right', 
      fontSize: 11, 
      color: COLORS.textMuted, 
      marginTop: 8 
    }}>
      {formattedTime}
    </Text>
  </View>
);

// ─── Connection Request Card (Confirmed) ─────────────────────────────
const ConfirmedRequestCard = ({ 
  supplierName, 
  formattedTime,
  onOrder,
}: {
  supplierName: string;
  formattedTime: string;
  onOrder?: () => void;
}) => (
  <View style={{
    backgroundColor: COLORS.connectedBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.connectedBorder,
  }}>
    <View style={{ 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between' 
    }}>
      {/* Left: Avatar + Text */}
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 }}>
        <View style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          borderWidth: 2,
          borderColor: COLORS.primaryMid,
          overflow: 'hidden',
        }}>
          <Image
            source={require('../../assets/images/3davatar.png')}
            style={{ width: 44, height: 44, borderRadius: 22 }}
          />
        </View>
        <Text style={{ 
          marginLeft: 12, 
          fontSize: 14, 
          color: COLORS.textPrimary, 
          flexShrink: 1,
          lineHeight: 20,
        }}>
          <Text style={{ fontWeight: '600' }}>{supplierName}</Text>
          {' '}is now your connection
        </Text>
      </View>

      {/* Right: Phone + Order */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: COLORS.white,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: COLORS.primaryMid,
          }}
        >
          <Feather name="phone" size={16} color={COLORS.primary} />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={onOrder}
          activeOpacity={0.8}
          style={{
            backgroundColor: COLORS.white,
            borderColor: COLORS.primaryMid,
            borderWidth: 1.5,
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text style={{ 
            color: COLORS.primary, 
            fontWeight: '700', 
            fontSize: 13, 
            marginRight: 4 
          }}>
            Order
          </Text>
          <Feather name="arrow-right" size={14} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>

    {/* Time */}
    <Text style={{ 
      textAlign: 'right', 
      fontSize: 11, 
      color: COLORS.textMuted, 
      marginTop: 8 
    }}>
      {formattedTime}
    </Text>
  </View>
);

// ─── Empty State ─────────────────────────────────────────────────────
const EmptyState = ({ message, icon }: { message: string; icon: string }) => (
  <View style={{ 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 40 
  }}>
    <View style={{
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: COLORS.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    }}>
      <Feather name={icon as any} size={28} color={COLORS.primaryMid} />
    </View>
    <Text style={{ 
      color: COLORS.textMuted, 
      fontSize: 14, 
      fontWeight: '500',
      textAlign: 'center',
    }}>
      {message}
    </Text>
  </View>
);

// ─── Main Component ──────────────────────────────────────────────────
export default function NotificationsScreen() {
  const isWeb = Platform.OS === 'web'; 
  
  const [confirmedRequests, setConfirmedRequests] = useState<number[]>([]);
  const [requestsList, setRequestsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllRequests, setShowAllRequests] = useState(false);

  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const retailerId = await secureStorage.getItem("userId");
      if (!retailerId) return;

      // ── Fetch all supplier businesses ONCE and reuse ──
      let allBusinesses: any[] = [];
      try {
        const allBizRes = await axiosInstance.get(`/api/supplier-business/all`);
        allBusinesses = allBizRes.data || [];
      } catch (e) {
        console.warn("Could not fetch supplier businesses:", e);
      }

      // ── Fetch Connection Requests ──
      try {
        const response = await axiosInstance.get(
          `/api/connections/retailer/${retailerId}/requests`
        );

        const requestsWithNames = await Promise.all(
          response.data.map(async (req: any) => {
            try {
              let name = 'Supplier';

              // Try supplier business name first (reusing the already-fetched list)
              const userBusiness = allBusinesses.find(
                (biz: any) => biz.supplierId === req.supplierId
              );

              if (userBusiness && userBusiness.name && userBusiness.name !== 'string') {
                name = userBusiness.name;
              }

              // Fallback to user API only if business name wasn't found
              if (name === 'Supplier') {
                try {
                  const userRes = await axiosInstance.get(`/api/users/${req.supplierId}`);
                  const { fullName, username } = userRes.data;

                  if (fullName && fullName !== 'string' && fullName.trim() !== '') {
                    name = fullName;
                  } else if (username && username !== 'string' && username.trim() !== '' && !username.includes('-')) {
                    name = username;
                  }
                } catch (userErr) {
                  console.warn(`Could not fetch user ${req.supplierId}`);
                }
              }

              return {
                ...req,
                supplierName: name,
                businessId: userBusiness?.businessId || '',
              };
            } catch (err) {
              console.error(`Error resolving name for supplier ${req.supplierId}:`, err);
              return { ...req, supplierName: 'Supplier', businessId: '' };
            }
          })
        );

        setRequestsList(requestsWithNames);
      } catch (err) {
        console.error("Error fetching connection requests:", err);
      }

      // ── Fetch Orders ──
      try {
        const ordersRes = await axiosInstance.get(`/api/orders/retailer/${retailerId}`);
        const rawOrders = ordersRes.data || [];

        if (rawOrders.length > 0) {
          const mappedOrders = await Promise.all(
            rawOrders.map(async (order: any) => {
              // ── Resolve Supplier Business Name ──
              let supplierName = order.supplierName && order.supplierName !== 'string' ? order.supplierName : '';

              if (order.supplierId) {
                const biz = allBusinesses.find((b: any) => b.supplierId === order.supplierId);
                if (biz?.name && biz.name !== 'string') {
                  supplierName = biz.name;
                }
              }

              if (!supplierName) {
                try {
                  const userRes = await axiosInstance.get(`/api/users/${order.supplierId}`);
                  const { fullName, username } = userRes.data;

                  if (fullName && fullName !== 'string' && fullName.trim() !== '') {
                    supplierName = fullName;
                  } else if (username && username !== 'string' && username.trim() !== '' && !username.includes('-')) {
                    supplierName = username;
                  }
                } catch (userErr) {
                  console.warn(`Could not fetch user for supplierId: ${order.supplierId}`);
                }
              }

              if (!supplierName) supplierName = 'Supplier';

              const actualDate = order.orderDate || order.createdAt || new Date().toISOString();

              let message = `Order with ${supplierName} is placed. Click to get info`;
              if (order.status === 'PROCESSING' || order.status === 'COMPLETED') {
                message = `Your order has been approved by ${supplierName}. Tap to view details.`;
              } else if (order.status === 'CANCELLED') {
                message = `Your order has been cancelled by ${supplierName}.`;
              }

              return {
                ...order,
                message,
                createdAt: actualDate
              };
            })
          );

          mappedOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setOrdersList(mappedOrders);
        } else {
          setOrdersList([]);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setOrdersList([]);
      } finally {
        setLoadingOrders(false);
      }
    } catch (error) {
      console.error("Error in fetchData:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setLoading(true);
    setLoadingOrders(true);
    fetchData();
  }, [fetchData]);

  const handleDelete = async (request: any) => {
    try {
      const retailerId = await secureStorage.getItem("userId");
      
      await axiosInstance.post("/api/connections/reject", null, {
        params: {
          retailerId: retailerId,
          supplierId: request.supplierId,
        },
      });

      setRequestsList((prev) => prev.filter(r => r.id !== request.id));
    } catch (error) {
      console.error("Error rejecting connection: ", error);
    }
  };

  const handleConfirm = async (request: any) => {
    try {
      const retailerId = await secureStorage.getItem("userId");

      await axiosInstance.post("/api/connections/accept", null, {
        params: {
          retailerId: retailerId,
          supplierId: request.supplierId,
        },
      });

      setConfirmedRequests((prev) => [...prev, request.id]);
    } catch (error) {
      console.error("Error accepting connection: ", error);
    }
  };

  // Split orders into today and past
  const todayOrders = ordersList.filter(o => isToday(o.createdAt));
  const pastOrders = ordersList.filter(o => !isToday(o.createdAt));

  const isAllEmpty = requestsList.length === 0 && ordersList.length === 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* ─── Header ─── */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.divider,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
      }}>
        <TouchableOpacity 
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: COLORS.bg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={{
          fontSize: 20,
          fontWeight: '700',
          color: COLORS.primary,
          marginLeft: 12,
          letterSpacing: -0.3,
        }}>
          Notifications
        </Text>
      </View>

      {/* ─── Content ─── */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={{ 
          paddingBottom: 40,
          ...(isAllEmpty && !loading && !loadingOrders ? { flex: 1 } : {}),
        }}
      >
        <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>

          {/* ─── Requests Section ─── */}
          <SectionHeader 
            title="Requests" 
            showViewAll={requestsList.length > 2} 
            onViewAll={() => setShowAllRequests(!showAllRequests)}
            viewAllLabel={showAllRequests ? 'Show less' : `View all (${requestsList.length})`}
          />

          {loading ? (
            <View style={{ paddingVertical: 30 }}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={{ 
                textAlign: 'center', 
                color: COLORS.textMuted, 
                marginTop: 12, 
                fontSize: 13 
              }}>
                Loading requests...
              </Text>
            </View>
          ) : requestsList.length === 0 ? (
            <EmptyState message="No pending requests" icon="inbox" />
          ) : (
            <View style={!showAllRequests && requestsList.length > 2 ? { maxHeight: 420, overflow: 'hidden' } : {}}>
              {(showAllRequests ? requestsList : requestsList.slice(0, 3)).map((request: any) => {
                const isConfirmed = confirmedRequests.includes(request.id);
                const supplierName = request.supplierName || 'Supplier';
                const formattedTime = formatTime(request.createdAt);

                return isConfirmed ? (
                  <ConfirmedRequestCard
                    key={request.id}
                    supplierName={supplierName}
                    formattedTime={formattedTime}
                    onOrder={() =>
                      router.push({
                        pathname: '/(retailer)/orderSupplierScreen',
                        params: {
                          supplierId: request.supplierId,
                          businessId: request.businessId || '',
                          supplierName,
                        },
                      })
                    }
                  />
                ) : (
                  <PendingRequestCard
                    key={request.id}
                    request={request}
                    supplierName={supplierName}
                    formattedTime={formattedTime}
                    onConfirm={() => handleConfirm(request)}
                    onDelete={() => handleDelete(request)}
                  />
                );
              })}
            </View>
          )}

          {/* ─── Divider ─── */}
          {(requestsList.length > 0 || !loading) && (ordersList.length > 0 || !loadingOrders) && (
            <View style={{ 
              height: 1, 
              backgroundColor: COLORS.border, 
              marginVertical: 8,
              marginHorizontal: -4,
            }} />
          )}

          {/* ─── Order Notifications ─── */}
          {loadingOrders ? (
            <View style={{ paddingVertical: 20 }}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          ) : (
            <View style={{ marginTop: 4 }}>
              
              {/* ─── Today Section ─── */}
              {todayOrders.map((order: any, idx: number) => (
                <OrderNotificationItem
                  key={order.id || idx}
                  message={order.message}
                  timeString={formatTime(order.createdAt)}
                  onPress={() =>
                    router.push({
                      pathname: "/(supplier)/orderDetails",
                      params: {
                        orderId: order.id,
                      },
                    })
                  }
                />
              ))}

              {/* ─── Last 30 Days Section ─── */}
              {pastOrders.map((order: any, idx: number) => (
                <OrderNotificationItem
                  key={order.id || `past-${idx}`}
                  message={order.message}
                  timeString={formatTime(order.createdAt)}
                  onPress={() =>
                    router.push({
                      pathname: "/(supplier)/orderDetails",
                      params: {
                        orderId: order.id,
                      },
                    })
                  }
                />
              ))}

              {/* Show empty state only if everything is empty */}
              {isAllEmpty && !loading && (
                <EmptyState message="No notifications yet" icon="bell-off" />
              )}
            </View>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}