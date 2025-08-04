import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { AntDesign, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

const CARD_MARGIN = 8;
const CARD_WIDTH = (require('react-native').Dimensions.get('window').width - 3 * CARD_MARGIN - 24) / 2; 

export default function FavouriteCard({ data, onConnect, connected, style }: any) {
  return (
    <View
      style={[{
        width: CARD_WIDTH,
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
      <View style={{ alignItems: 'center', marginBottom: 8 }}>
        <Image source={require('../../assets/images/fav_avatar.png')} style={{ width: 56, height: 56, borderRadius: 28 }} />
      </View>
      <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#111827', marginBottom: 2 }} numberOfLines={1} ellipsizeMode="tail">{data.name}</Text>
      <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 2 }}>{data.person}</Text>
      <Text style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 6 }}>{data.distance}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6, justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <AntDesign name="star" size={16} color="#22C55E" />
          <Text style={{ marginLeft: 4, fontSize: 14, color: '#222', fontWeight: '500' }}>{data.rating}</Text>
          <Text style={{ marginLeft: 2, fontSize: 14, color: '#444' }}>({data.reviews})</Text>
        </View>
      </View>
      {/* Active order / last active row with box icon */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <MaterialCommunityIcons name="cube-outline" size={18} color={data.activeOrder ? '#2563eb' : '#9CA3AF'} style={{ marginRight: 6 }} />
        <Text style={{ fontSize: 14, color: data.activeOrder ? '#2563eb' : '#9CA3AF', fontWeight: data.activeOrder ? '500' : '400' }}>{data.lastActive}</Text>
      </View>

      {/* Order and Connect buttons */}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginTop: 8 }}>
        {data.showOrder && (
          <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#10B981' }}>
            <Text style={{ textAlign: 'center', color: '#10B981', fontWeight: '500', fontSize: 16, marginRight: 8 }}>Order</Text>
            <AntDesign name="arrowright" size={18} color="#10B981" />
          </TouchableOpacity>
        )}

        {data.showConnect && (
          <TouchableOpacity
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#10B981', backgroundColor: connected ? '#10B981' : 'white', marginLeft: data.showOrder ? 8 : 0 }}
            onPress={onConnect}
          >
            <FontAwesome5 name="user-plus" size={16} color={connected ? 'white' : '#10B981'} style={{ marginRight: 8 }} />
            <Text style={{ textAlign: 'center', fontWeight: '500', fontSize: 16, color: connected ? 'white' : '#10B981' }}>Connect</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
