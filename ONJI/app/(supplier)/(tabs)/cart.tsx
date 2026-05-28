import React, { useState } from 'react';
import {
  FlatList,
  Image,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Feather,
  Ionicons,
} from '@expo/vector-icons';

// ─────────────────────────────────────────────────────────────
// AVATAR — update path if needed
// ─────────────────────────────────────────────────────────────
const AVATAR = require('../../../assets/images/3davatar.png');

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const FILTERS = ['A-Z', 'Most Ordered', 'Recent', 'This Month'];

type Tab = 'new' | 'active' | 'delivered';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface Order {
  id: string;
  supplierName: string;
  location: string;
  phone: string;
  orderId: string;
  date: string;
  time: string;
  deliveryTime: string;
  paymentType: string;
  totalShipmentItems: string;
  totalQty: string;
  total: string;
  status: 'Approved' | 'Delivered';
  isNewBuyer: boolean;
  expanded: boolean;
}

// ─────────────────────────────────────────────────────────────
// DUMMY DATA
// ─────────────────────────────────────────────────────────────

const dummyNewOrders: Order[] = Array.from({ length: 4 }, (_, i) => ({
  id: `new-${i + 1}`,
  supplierName: 'Harvest Ledger Sourcing',
  location: 'Udupi',
  phone: '7349322258',
  orderId: '#HL-99284',
  date: 'Oct 24, 2023',
  time: '09:45 AM',
  deliveryTime: 'Afternoon',
  paymentType: 'Credit Requested',
  totalShipmentItems: '18 Items',
  totalQty: '240 Kg',
  total: '₹6,520',
  status: 'Approved',
  isNewBuyer: i < 2,
  expanded: true, // new requests are expanded by default
}));

const dummyActiveOrders: Order[] = Array.from({ length: 4 }, (_, i) => ({
  id: `active-${i + 1}`,
  supplierName: 'Harvest Ledger Sourcing',
  location: 'Udupi',
  phone: '7349322258',
  orderId: '#HL-99284',
  date: 'Oct 24, 2023',
  time: '09:45 AM',
  deliveryTime: 'Afternoon',
  paymentType: 'Credit Requested',
  totalShipmentItems: '18 Items',
  totalQty: '240 Kg',
  total: '₹6,520',
  status: 'Approved',
  isNewBuyer: false,
  expanded: false,
}));

const dummyDeliveredOrders: Order[] = Array.from({ length: 4 }, (_, i) => ({
  id: `delivered-${i + 1}`,
  supplierName: 'Harvest Ledger Sourcing',
  location: 'Udupi',
  phone: '7349322258',
  orderId: '#HL-99284',
  date: 'Oct 24, 2023',
  time: '09:45 AM',
  deliveryTime: 'Afternoon',
  paymentType: 'Credit Requested',
  totalShipmentItems: '18 Items',
  totalQty: '240 Kg',
  total: '₹6,520',
  status: 'Delivered',
  isNewBuyer: false,
  expanded: false,
}));

// ─────────────────────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────────────────────

export default function OrderRequestScreen() {
  const [selectedTab, setSelectedTab] = useState<Tab>('new');
  const [selectedFilter, setSelectedFilter] = useState('Recent');
  const [newOrders, setNewOrders] = useState(dummyNewOrders);
  const [activeOrders, setActiveOrders] = useState(dummyActiveOrders);
  const [deliveredOrders, setDeliveredOrders] = useState(dummyDeliveredOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'aggregate' | 'retailer'>('retailer');

  // ── Get current tab's data ──
  const getCurrentOrders = () => {
    if (selectedTab === 'new') return newOrders;
    if (selectedTab === 'active') return activeOrders;
    return deliveredOrders;
  };

  const setCurrentOrders = (updater: (prev: Order[]) => Order[]) => {
    if (selectedTab === 'new') setNewOrders(updater);
    else if (selectedTab === 'active') setActiveOrders(updater);
    else setDeliveredOrders(updater);
  };

  // ── Toggle accordion ──
  const toggleAccordion = (id: string) => {
    setCurrentOrders(prev =>
      prev.map(item =>
        item.id === id ? { ...item, expanded: !item.expanded } : item
      )
    );
  };

  // ─────────────────────────────────────────────────────────────
  // STATUS BADGE
  // ─────────────────────────────────────────────────────────────

  const renderStatusBadge = (status: string) => {
    const isDelivered = status === 'Delivered';
    return (
      <View
        style={{
          backgroundColor: isDelivered ? '#DCFCE7' : '#ECFDF3',
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 20,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: isDelivered ? '#16A34A' : '#22C55E',
          }}
        />
        <Text style={{ color: '#15803D', fontSize: 11, fontWeight: '600' }}>
          {status}
        </Text>
      </View>
    );
  };

  // ─────────────────────────────────────────────────────────────
  // ACTION BUTTONS — per tab
  // ─────────────────────────────────────────────────────────────

  const renderActionButtons = (tab: Tab) => {
    if (tab === 'new') {
      return (
        <TouchableOpacity
          style={{
            backgroundColor: '#2F8F2F',
            paddingVertical: 13,
            borderRadius: 10,
            alignItems: 'center',
            marginTop: 14,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
            View Order Details
          </Text>
        </TouchableOpacity>
      );
    }

    if (tab === 'active') {
      return (
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: '#2F8F2F',
              paddingVertical: 13,
              borderRadius: 10,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
              Order Details
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: '#F3F4F6',
              paddingVertical: 13,
              borderRadius: 10,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#2F8F2F', fontWeight: '600', fontSize: 14 }}>
              Track order
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    // delivered
    return (
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: '#F3F4F6',
            paddingVertical: 13,
            borderRadius: 10,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#2F8F2F', fontWeight: '600', fontSize: 14 }}>
            Order Details
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: '#F3F4F6',
            paddingVertical: 13,
            borderRadius: 10,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#2F8F2F', fontWeight: '600', fontSize: 14 }}>
            Rate Vendor
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ─────────────────────────────────────────────────────────────
  // ORDER CARD
  // ─────────────────────────────────────────────────────────────

  const renderCard = ({ item }: { item: Order }) => {
    const isNew = selectedTab === 'new';
    const isDelivered = selectedTab === 'delivered';

    return (
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 18,
          padding: 14,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: '#ECECEC',
        }}
      >
        {/* ── HEADER ROW ── */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          {/* Avatar */}
          <Image
            source={AVATAR}
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              backgroundColor: '#D9F99D',
            }}
          />

          {/* Name */}
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>
              {item.supplierName}
            </Text>
          </View>

          {/* Items toggle — shown on active & delivered */}
          {!isNew && (
            <TouchableOpacity
              onPress={() => toggleAccordion(item.id)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <Text style={{ fontSize: 12, color: '#6B7280' }}>Items</Text>
              <Feather
                name={item.expanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color="#6B7280"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* ── SUBROW: badges + location + phone + View Items ── */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 10,
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {/* New Buyer badge — only on new tab */}
            {isNew && item.isNewBuyer && (
              <View
                style={{
                  backgroundColor: '#ECFDF3',
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: '#22C55E',
                  }}
                />
                <Text style={{ color: '#15803D', fontSize: 10, fontWeight: '600' }}>
                  New Buyer
                </Text>
              </View>
            )}

            <Text style={{ fontSize: 11, color: '#6B7280' }}>{item.location}</Text>
            <Text style={{ fontSize: 11, color: '#6B7280' }}>{item.phone}</Text>
          </View>

          {/* View Items — only on new tab */}
          {isNew && (
            <TouchableOpacity onPress={() => toggleAccordion(item.id)}>
              <Text style={{ color: '#6B7280', fontSize: 11 }}>
                View Items {item.expanded ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── DATE / TIME / ORDER ID ROW ── */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 12,
          }}
        >
          <Text style={{ color: '#6B7280', fontSize: 11 }}>{item.date}</Text>
          <Text style={{ color: '#6B7280', fontSize: 11 }}>· {item.time}</Text>

          {/* Order ID — shown on active & delivered */}
          {!isNew && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ color: '#9CA3AF', fontSize: 11 }}>Latest Order Id</Text>
              <Text style={{ color: '#111827', fontSize: 11, fontWeight: '700' }}>
                {item.orderId}
              </Text>
              <Ionicons name="copy-outline" size={14} color="#15803D" />
            </View>
          )}

          {/* Status badge — shown on active & delivered */}
          {!isNew && renderStatusBadge(item.status)}
        </View>

        {/* ── DASHED DIVIDER ── */}
        <View
          style={{
            marginTop: 12,
            borderTopWidth: 1,
            borderStyle: 'dashed',
            borderColor: '#E5E7EB',
            paddingTop: 12,
          }}
        >
          {/* ── EXPANDED DETAILS — new tab only ── */}
          {isNew && item.expanded && (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={{ color: '#4B5563', fontSize: 13 }}>Time of delivery</Text>
                <Text style={{ color: '#111827', fontSize: 13 }}>
                  {item.date}  ·  {item.deliveryTime}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={{ color: '#4B5563', fontSize: 13 }}>Payment Type</Text>
                <Text style={{ color: '#111827', fontSize: 13 }}>{item.paymentType}</Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={{ color: '#4B5563', fontSize: 13 }}>Total Shipment Items</Text>
                <Text style={{ color: '#111827', fontSize: 13 }}>{item.totalShipmentItems}</Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ color: '#4B5563', fontSize: 13 }}>Total Quantity (weight)</Text>
                <Text style={{ color: '#111827', fontSize: 13 }}>{item.totalQty}</Text>
              </View>
            </>
          )}

          {/* ── GRAND TOTAL ROW ── */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 14,
            }}
          >
            <Text style={{ color: '#111827', fontSize: 16, fontWeight: '700' }}>
              Grand Total
            </Text>

            <Text style={{ color: '#15803D', fontSize: 28, fontWeight: '800' }}>
              {item.total}
            </Text>
          </View>

          {/* ── ACTION BUTTONS ── */}
          {renderActionButtons(selectedTab)}
        </View>
      </View>
    );
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAF8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAF8" />

      <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>

        {/* TITLE */}
        <Text style={{ color: '#2F8F2F', fontSize: 18, fontWeight: '700' }}>
          Order Requests
        </Text>

        {/* AGGREGATE / RETAILER ORDERS TOGGLE */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#E5E7EB',
            borderRadius: 16,
            padding: 4,
            marginTop: 16,
          }}
        >
          <TouchableOpacity
            onPress={() => setViewMode('aggregate')}
            style={{
              flex: 1,
              backgroundColor: viewMode === 'aggregate' ? '#fff' : 'transparent',
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: viewMode === 'aggregate' ? '#2F8F2F' : '#525252',
                fontSize: 13,
                fontWeight: viewMode === 'aggregate' ? '600' : '400',
              }}
            >
              Aggregate
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setViewMode('retailer')}
            style={{
              flex: 1,
              backgroundColor: viewMode === 'retailer' ? '#fff' : 'transparent',
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: viewMode === 'retailer' ? '#2F8F2F' : '#525252',
                fontSize: 13,
                fontWeight: viewMode === 'retailer' ? '600' : '400',
              }}
            >
              Retailer Orders
            </Text>
          </TouchableOpacity>
        </View>

        {/* SEARCH + FILTER */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 18,
            gap: 10,
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#fff',
              borderRadius: 14,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              paddingHorizontal: 14,
              height: 52,
            }}
          >
            <Feather name="search" size={20} color="#9CA3AF" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder='Search "Random kaka"'
              placeholderTextColor="#9CA3AF"
              style={{ flex: 1, marginLeft: 10, color: '#111827' }}
            />
          </View>

          <TouchableOpacity
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              backgroundColor: '#fff',
              borderWidth: 1,
              borderColor: '#E5E7EB',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Feather name="sliders" size={20} color="#2F8F2F" />
          </TouchableOpacity>
        </View>

        {/* TABS — New Requests | Active | Delivered */}
        <View style={{ flexDirection: 'row', marginTop: 18, gap: 20 }}>
          {(
            [
              { key: 'new', label: 'New Requests (5+)' },
              { key: 'active', label: 'Active' },
              { key: 'delivered', label: 'Delivered' },
            ] as { key: Tab; label: string }[]
          ).map(tab => (
            <TouchableOpacity key={tab.key} onPress={() => setSelectedTab(tab.key)}>
              <Text
                style={{
                  color: selectedTab === tab.key ? '#15803D' : '#525252',
                  fontWeight: selectedTab === tab.key ? '700' : '500',
                  fontSize: 14,
                }}
              >
                {tab.label}
              </Text>
              {selectedTab === tab.key && (
                <View
                  style={{
                    height: 2,
                    backgroundColor: '#15803D',
                    marginTop: 6,
                    borderRadius: 10,
                  }}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* FILTER CHIPS */}
        <View style={{ flexDirection: 'row', marginTop: 16, gap: 10, flexWrap: 'wrap' }}>
          {FILTERS.map(filter => {
            const isSelected = selectedFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                onPress={() => setSelectedFilter(filter)}
                style={{
                  backgroundColor: isSelected ? '#E9D5FF' : '#F3E8FF',
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: '#E9D5FF',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Text style={{ color: '#9333EA', fontSize: 12, fontWeight: '500' }}>
                  {filter}
                </Text>
                {isSelected && (
                  <Feather name="x" size={12} color="#9333EA" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ORDER CARDS LIST */}
      <FlatList
        data={getCurrentOrders()}
        keyExtractor={item => item.id}
        renderItem={renderCard}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 18,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}