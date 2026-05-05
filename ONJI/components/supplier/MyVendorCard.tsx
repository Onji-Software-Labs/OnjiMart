import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5, AntDesign, Ionicons, Feather } from '@expo/vector-icons';
import { INewSupplier } from '@/components/supplier/NewSupplierCard';

const MyVendorCard = ({ supplier }: { supplier: INewSupplier }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
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

        <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)} className="p-1">
          {isFavorite ? (
            <AntDesign name="heart" size={18} color="#EF4444" />
          ) : (
            <Ionicons name="heart-outline" size={18} color="#9CA3AF" />
          )}
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-between items-center mt-3">
        <View className="flex-row items-center">
          <Feather name="clock" size={12} color="#9CA3AF" />
          <Text className="text-xs text-gray-400 ml-1">3 days ago</Text>
        </View>
        <View className="flex-row items-center">
          <TouchableOpacity className="mr-4">
            <Feather name="phone" size={16} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center bg-green-500 px-3 py-1.5 rounded-lg">
            <Text className="text-white font-medium text-xs mr-1">Connected</Text>
            <Ionicons name="arrow-forward" size={13} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default MyVendorCard;