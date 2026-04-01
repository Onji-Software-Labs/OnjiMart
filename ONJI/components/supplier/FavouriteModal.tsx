import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import FavouriteCard from './FavouriteCard';
import { useRouter } from 'expo-router';  // ✅ Added

const FAVOURITES = [
  {
    id: '1',
    name: 'Sunway trading',
    person: 'Random kaka',
    distance: '3 kms away, Mangalore',
    rating: 4.5,
    reviews: 60,
    activeOrder: true,
    lastActive: 'Active order',
    showOrder: true,
    showConnect: false,
  },
  {
    id: '2',
    name: 'Sunway trading',
    person: 'Random kaka',
    distance: '3 kms away, Mangalore',
    rating: 4.5,
    reviews: 60,
    activeOrder: false,
    lastActive: '3 days ago',
    showOrder: false,
    showConnect: true,
  },
  {
    id: '3',
    name: 'Sunway trading',
    person: 'Random kaka',
    distance: '3 kms away, Mangalore',
    rating: 4.5,
    reviews: 60,
    activeOrder: false,
    lastActive: '2 days ago',
    showOrder: true,
    showConnect: false,
  },
  {
    id: '4',
    name: 'Sunway trading',
    person: 'Random kaka',
    distance: '3 kms away, Mangalore',
    rating: 4.5,
    reviews: 60,
    activeOrder: false,
    lastActive: '1 day ago',
    showOrder: false,
    showConnect: true,
  },
];

const CARD_MARGIN = 8;

export default function FavouriteModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const router = useRouter();                              // ✅ Added
  const [connectedIds, setConnectedIds] = useState<string[]>([]);
  const [orderedIds, setOrderedIds] = useState<string[]>([]); // ✅ Added — tracks Connect→Order flip

  if (!visible) return null;

  const handleConnect = (id: string) => {
    setConnectedIds(prev => {
      if (prev.includes(id)) return prev.filter(cid => cid !== id);
      setOrderedIds(o => [...o, id]); // ✅ flip this card to show Order button
      return [...prev, id];
    });
  };

  const handleOrder = () => {    // ✅ Added
    onClose();                   // close modal first
    router.push('/(supplier)/orderSupplierScreen');  // then navigate
  };

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'white', zIndex: 50 }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={onClose} className="mr-4">
          <AntDesign name="arrowleft" size={24} color="#10B981" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-green-600">Favourite</Text>
      </View>

      {/* Cards Grid */}
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {FAVOURITES.concat(FAVOURITES).map((item, idx) => {
            const cardKey = item.id + idx;
            const isNowConnected = orderedIds.includes(cardKey); // ✅ was Connect, now Order
            return (
              <FavouriteCard
                key={cardKey}
                data={{
                  ...item,
                  showOrder: item.showOrder || isNowConnected,    // ✅ flip to Order
                  showConnect: item.showConnect && !isNowConnected, // ✅ hide Connect
                }}
                connected={connectedIds.includes(cardKey)}
                onConnect={() => handleConnect(cardKey)}
                onOrder={handleOrder}   // ✅ wire Order button to navigation
                style={{ marginBottom: CARD_MARGIN }}
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}