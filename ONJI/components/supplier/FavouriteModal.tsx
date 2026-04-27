import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import FavouriteCard from './FavouriteCard';
import { useRouter } from 'expo-router';
import { INewSupplier } from './NewSupplierCard';

const CARD_MARGIN = 8;

interface FavouriteModalProps {
  visible: boolean;
  onClose: () => void;
  favourites: INewSupplier[];   // ← only the suppliers the user hearted
}

export default function FavouriteModal({ visible, onClose, favourites }: FavouriteModalProps) {
  const router = useRouter();
  const [connectedIds, setConnectedIds] = useState<string[]>([]);
  const [orderedIds, setOrderedIds] = useState<string[]>([]);

  if (!visible) return null;

  const handleConnect = (id: string) => {
    setConnectedIds(prev => {
      if (prev.includes(id)) return prev.filter(cid => cid !== id);
      setOrderedIds(o => [...o, id]);
      return [...prev, id];
    });
  };

  const handleOrder = () => {
    onClose();
    router.push('/(supplier)/orderSupplierScreen');
  };

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
              const isNowConnected = orderedIds.includes(cardKey);
              return (
                <FavouriteCard
                  key={cardKey}
                  data={{
                    id: item.id,
                    supplierId: item.id,
                    businessId: item.businessId,
                    name: item.name,
                    person: item.description,
                    distance: item.location,
                    rating: item.rating,
                    reviews: item.reviews,
                    activeOrder: false,
                    lastActive: '',
                    showOrder: false,
                    showConnect: true,
                  }}
                  connected={connectedIds.includes(cardKey)}
                  onConnect={() => handleConnect(cardKey)}
                  onOrder={handleOrder}
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