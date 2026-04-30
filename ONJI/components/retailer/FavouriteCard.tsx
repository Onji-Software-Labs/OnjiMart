import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { AntDesign, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { ConnectionStatus } from '../../lib/api/connection';
import { useRouter } from 'expo-router';

const CARD_MARGIN = 8;
const SCROLL_PADDING = 24;

export default function FavouriteCard({
  supplier,
  connectionStatus,
  onConnect,
  style
}: {
  supplier: any;
  connectionStatus: ConnectionStatus;
  onConnect: (id: string) => void;
  style?: any;
}) {
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const router = useRouter();


  useEffect(() => {
    const onChange = (result: any) => {
      setScreenData(result.window);
    };

    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);

  const cardWidth = (screenData.width - SCROLL_PADDING - CARD_MARGIN) / 2;

  // 🔥 Button Logic
  const getButtonText = () => {
    if (connectionStatus === 'PENDING') return 'Cancel';
    if (connectionStatus === 'ACCEPTED') return 'Order';
    return 'Connect';
  };

  const handlePress = () => {
  if (connectionStatus === 'ACCEPTED') {
    router.push({
      pathname: '/(retailer)/orderSupplierScreen',
      params: {
        supplierId: supplier.id,
        businessId: supplier.businessId,
        supplierName: supplier.name,
      },
    });
  } else if (connectionStatus === 'NONE' || connectionStatus === 'REJECTED') {
    // ✅ open ConnectScreen
    router.push({
      pathname: '/(retailer)/connectScreen',
      params: {
        supplierId: supplier.id,
        businessId: supplier.businessId,
      },
    });
  } else if (connectionStatus === 'PENDING') {
    // ✅ cancel directly
    onConnect(supplier.id);
  }
};

  return (
    <View
      style={[{
        width: cardWidth,
        marginBottom: CARD_MARGIN * 2,
        backgroundColor: 'white',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 16,
      }, style]}
    >
      {/* Avatar */}
      <View style={{ alignItems: 'center', marginBottom: 8 }}>
        <Image
          source={require('../../assets/images/fav_avatar.png')}
          style={{ width: 56, height: 56, borderRadius: 28 }}
        />
      </View>

      {/* Supplier Info */}
      <Text
        style={{ fontWeight: 'bold', fontSize: 16, color: '#111827', marginBottom: 2 }}
        numberOfLines={1}
      >
        {supplier.name}
      </Text>

      <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 2 }}>
        {supplier.description || 'No contact info'}
      </Text>

      <Text style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 6 }}>
        {supplier.location || 'Location unavailable'}
      </Text>

      {/* Rating */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <AntDesign name="star" size={16} color="#22C55E" />
        <Text style={{ marginLeft: 4, fontSize: 14, color: '#222', fontWeight: '500' }}>
          {supplier.rating || 0}
        </Text>
        <Text style={{ marginLeft: 2, fontSize: 14, color: '#444' }}>
          ({supplier.reviews || 0})
        </Text>
      </View>

      {/* Activity (optional safe fallback) */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <MaterialCommunityIcons name="cube-outline" size={18} color="#9CA3AF" />
        <Text style={{ fontSize: 14, color: '#9CA3AF', marginLeft: 6 }}>
          Recently active
        </Text>
      </View>

      {/* 🔥 Button */}
      <View style={{ marginTop: 8 }}>
        <TouchableOpacity
          onPress={handlePress}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 8,
            borderRadius: 8,
            borderWidth: 1,
            borderColor:
              connectionStatus === 'PENDING' ? '#D1D5DB' : '#10B981',
            backgroundColor: 'white',
          }}
        >
          <Text
            style={{
              color:
                connectionStatus === 'PENDING' ? '#6B7280' : '#10B981',
              fontWeight: '500',
              fontSize: 16,
            }}
          >
            {getButtonText()}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}