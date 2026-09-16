import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import FavouriteCard from './FavouriteCard';
import { useRouter } from 'expo-router';
import { INewSupplier } from './NewSupplierCard';
import { ConnectionStatus } from '../../lib/api/connection';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLUMN_GAP = 6;
const ROW_GAP = 42;

interface FavouriteModalProps {
  visible: boolean;
  onClose: () => void;
  favourites: INewSupplier[];
  connectionStatuses: Record<string, ConnectionStatus>;
  onConnect: (id: string) => void;
  onToggleFavourite: (id: string) => void;
}

// Split favourites into pairs
const chunkIntoRows = (items: INewSupplier[], size = 2) => {
  const rows: INewSupplier[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
};

export default function FavouriteModal({
  visible,
  onClose,
  favourites,
  connectionStatuses,
  onConnect,
  onToggleFavourite,
}: FavouriteModalProps) {
  const router = useRouter();

  if (!visible) return null;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'white', zIndex: 50 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['top']}>
        {/* Header */}
        <View className="flex-row items-center px-4 py-4 border-b border-gray-200 bg-white">
          <TouchableOpacity onPress={onClose} className="mr-4">
            <AntDesign name="arrow-left" size={24} color="#2E7D32" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#2E7D32' }}>
            Favourite
          </Text>
          {favourites.length > 0 && (
            <Text style={{ fontSize: 20, color: '#2E7D32', marginLeft: 6 }}>
              ({favourites.length})
            </Text>
          )}
        </View>

        {/* Empty state */}
        {favourites.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
            <Ionicons name="heart-outline" size={48} color="#E5E7EB" style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#6B7280', textAlign: 'center', marginBottom: 8 }}>
              No favourites yet
            </Text>
            <Text style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', lineHeight: 20 }}>
              Tap the heart ♡ on a supplier card to add them here.
            </Text>
          </View>
        ) : (
          /* Cards Grid — 2 columns per row, each row is its own card */
          <ScrollView contentContainerStyle={{ paddingTop: 20 }}>
            {chunkIntoRows(favourites, 2).map((row, rowIndex) => (
              <View
                key={rowIndex}
                style={{
                  flexDirection: 'row',
                  backgroundColor: '#F7E8FF',
                  margin: 8,
                  padding: 5,
                  columnGap: COLUMN_GAP,
                  marginBottom: ROW_GAP,
                }}
              >
                {row.map((item) => (
                  <View key={item.id} style={{ flex: 1 }}>
                    <FavouriteCard
                      supplier={item}
                      connectionStatus={connectionStatuses[item.id] ?? 'NONE'}
                      onConnect={() => onConnect(item.id)}
                      onToggleFavourite={onToggleFavourite}
                    />
                  </View>
                ))}
                {row.length === 1 && <View style={{ flex: 1 }} />}
              </View>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}