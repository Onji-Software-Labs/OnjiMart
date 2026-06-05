import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5, AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { INewSupplier } from '@/app/(supplier)/(tabs)/Vendor';

const FindVendorCard = ({
  supplier,
  connectionStatus,
  isFavourite,
  onConnect,
  onToggleFavourite,
}: {
  supplier: INewSupplier;
  connectionStatus: string;
  isFavourite: boolean;
  onConnect: (id: string) => void;
  onToggleFavourite: (id: string) => void;
}) => (
  <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm">
    <View className="flex-row items-center">
      {/* Avatar */}
      <View className="w-14 h-14 rounded-full bg-blue-100 mr-3 overflow-hidden items-center justify-center">
        <FontAwesome5 name="user-alt" size={20} color="#9CA3AF" />
      </View>

      {/* Info */}
      <View className="flex-1">
        <Text className="text-base font-bold text-gray-800">
          {supplier.name}
        </Text>

        <Text className="text-sm text-gray-500">
          {supplier.contactNumber || 'No phone number'}
        </Text>

        <Text className="text-xs text-gray-400 mt-0.5">
          {supplier.location || '3 kms away, Udupi'}
        </Text>

        <View className="flex-row items-center mt-1">
          <AntDesign name="star" size={11} color="#10B981" />
          <Text className="text-xs text-green-500 ml-1 font-medium">
            4.5(6)
          </Text>
          <Text className="text-xs ml-2"></Text>
        </View>
      </View>

      {/* Right Side */}
      <View className="items-end">
        <TouchableOpacity
          onPress={() => onToggleFavourite(supplier.id)}
          className="mb-4"
        >
          {isFavourite ? (
            <AntDesign name="heart" size={18} color="#EF4444" />
          ) : (
            <Ionicons name="heart-outline" size={18} color="#9CA3AF" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onConnect(supplier.id)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 10,
            borderWidth: 1,
            borderColor:
              connectionStatus === 'PENDING'
                ? '#D1D5DB'
                : '#34D399',
            backgroundColor:
              connectionStatus === 'ACCEPTED'
                ? '#ECFDF5'
                : '#FFFFFF',
          }}
        >
          {connectionStatus === 'PENDING' ? (
            <>
              <Text className="text-gray-600 font-semibold mr-2">
                Cancel
              </Text>
              <AntDesign
                name="close"
                size={14}
                color="#6B7280"
              />
            </>
          ) : connectionStatus === 'ACCEPTED' ? (
            <>
              <Text className="text-green-600 font-medium mr-2">
                Connected
              </Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color="#10B981"
              />
            </>
          ) : (
            <>
              <Text className="text-green-500 font-medium mr-2">
                Connect
              </Text>

              <MaterialCommunityIcons
                name="account-plus"
                size={16}
                color="#22C55E"
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

export default FindVendorCard;

