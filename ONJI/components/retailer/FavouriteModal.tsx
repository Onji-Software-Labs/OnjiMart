import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import FavouriteCard from './FavouriteCard';
import { useRouter } from 'expo-router';
import { INewSupplier } from './NewSupplierCard';
import { ConnectionStatus } from '../../lib/api/connection';

const CARD_MARGIN = 8;

interface FavouriteModalProps {
  visible: boolean;
  onClose: () => void;
  favourites: INewSupplier[];
  connectionStatuses: Record<string, ConnectionStatus>;
  onConnect: (id: string) => void;
}

export default function FavouriteModal({
  visible,
  onClose,
  favourites,
  connectionStatuses,
  onConnect
}: FavouriteModalProps) {
  const router = useRouter();


  if (!visible) return null;

  

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'white', zIndex: 50 }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={onClose} className="mr-4">
          <AntDesign name="arrowleft" size={24} color="#10B981" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-green-600">Favourite</Text>
        {favourites.length > 0 && (
          <Text style={{ fontSize: 12, color: '#6B7280', marginLeft: 8 }}>
            ({favourites.length})
          </Text>
        )}
      </View>

      {/* Empty state */}
      {favourites.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
          <AntDesign name="hearto" size={48} color="#E5E7EB" style={{ marginBottom: 16 }} />
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#6B7280', textAlign: 'center', marginBottom: 8 }}>
            No favourites yet
          </Text>
          <Text style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', lineHeight: 20 }}>
            Tap the heart ♡ on a supplier card to add them here.
          </Text>
        </View>
      ) : (
        /* Cards Grid */
        <ScrollView contentContainerStyle={{ padding: 12 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {favourites.map((item) => {
              const cardKey = item.id;
              return (
                <FavouriteCard
                  key={cardKey}
                  supplier={item}
                  connectionStatus={connectionStatuses[item.id] ?? 'NONE'}
                  onConnect={() => onConnect(item.id)}
                  style={{ marginBottom: CARD_MARGIN }}
                />
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
