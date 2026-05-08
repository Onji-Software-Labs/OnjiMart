import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5, AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { INewSupplier } from '@/app/(supplier)/(tabs)/vendor';

const FindVendorCard = ({
  supplier,
  isConnected,
  isFavourite,
  onConnect,
  onToggleFavourite,
}: {
  supplier: INewSupplier;
  isConnected: boolean;
  isFavourite: boolean;
  onConnect: (id: string) => void;
  onToggleFavourite: (id: string) => void;
}) => (
  <View className="bg-white rounded-2xl p-3 mb-3 border border-gray-100 shadow-sm">
    <View className="flex-row justify-between items-start">
      <View className="flex-row flex-1">
        <View className="w-12 h-12 rounded-full bg-orange-100 mr-3 overflow-hidden items-center justify-center">
          <FontAwesome5 name="user-alt" size={20} color="#9CA3AF" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-gray-800">{supplier.name}</Text>
          <Text className="text-xs text-gray-500">{supplier.description || 'Random kaka'}</Text>
          <Text className="text-xs text-gray-400 mt-0.5">{supplier.location || '3 kms away, Udupi'}</Text>
          <View className="flex-row items-center mt-1">
            <AntDesign name="star" size={11} color="#10B981" />
            <Text className="text-xs text-green-500 ml-1 font-medium">4.5(6)</Text>
            <Text className="text-xs ml-2">🥔 🍏</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity onPress={() => onToggleFavourite(supplier.id)} className="p-1">
        {isFavourite ? (
          <AntDesign name="heart" size={18} color="#EF4444" />
        ) : (
          <Ionicons name="heart-outline" size={18} color="#9CA3AF" />
        )}
      </TouchableOpacity>
    </View>
    <View className="items-end mt-3">
      <TouchableOpacity
        onPress={() => onConnect(supplier.id)}
        className="flex-row items-center px-3 py-1.5 rounded-lg border border-gray-300 bg-white"
      >
        {isConnected ? (
          <>
            <Text className="text-gray-500 text-xs font-medium mr-1">Cancel</Text>
            <AntDesign name="close" size={13} color="#6B7280" />
          </>
        ) : (
          <>
            <Text className="text-gray-700 text-xs font-medium mr-1">Connect</Text>
            <MaterialCommunityIcons name="account-plus" size={14} color="#10B981" />
          </>
        )}
      </TouchableOpacity>
    </View>
  </View>
);

export default FindVendorCard;