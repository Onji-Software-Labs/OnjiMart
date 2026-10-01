import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

// Mock data for your store items
const PRODUCTS = [
  { id: '1', name: 'Fresh Carrots', price: '2.50', unit: 'kg', stock: 45, image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=200&auto=format&fit=crop' },
  { id: '2', name: 'Organic Tomatoes', price: '3.20', unit: 'kg', stock: 12, image: 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?q=80&w=200&auto=format&fit=crop' },
  { id: '3', name: 'Green Bell Pepper', price: '1.80', unit: 'pc', stock: 88, image: 'https://images.unsplash.com/photo-1563565312879-c2753297bc58?q=80&w=200&auto=format&fit=crop' },
  { id: '4', name: 'Red Onions', price: '4.00', unit: 'kg', stock: 0, image: 'https://images.unsplash.com/photo-1508747703725-719777637510?q=80&w=200&auto=format&fit=crop' },
];

export default function StoreScreen() {
  return (
    <View className="flex-1 bg-white pt-12">
      {/* Header Section */}
      <View className="px-5 flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-2xl font-bold text-gray-900">Your Store</Text>
          <Text className="text-gray-500">Manage your product catalog</Text>
        </View>
        <TouchableOpacity className="bg-[#2E7D32] p-2 rounded-full">
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5 mb-6 max-h-10">
        {['All Items', 'In Stock', 'Out of Stock', 'Vegetables', 'Fruits'].map((chip, i) => (
          <TouchableOpacity 
            key={chip} 
            className={`mr-3 px-4 py-2 rounded-full border ${i === 0 ? 'bg-[#E8F5E9] border-[#2E7D32]' : 'bg-white border-gray-200'}`}
          >
            <Text className={i === 0 ? 'text-[#2E7D32] font-semibold' : 'text-gray-600'}>{chip}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Product List */}
      <FlatList
        data={PRODUCTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View className="flex-row items-center bg-gray-50 p-3 rounded-2xl mb-4 border border-gray-100">
            <Image 
              source={{ uri: item.image }} 
              className="w-20 h-20 rounded-xl bg-gray-200" 
            />
            
            <View className="flex-1 ml-4">
              <Text className="text-lg font-semibold text-gray-800">{item.name}</Text>
              <Text className="text-gray-500">{item.price} / {item.unit}</Text>
              
              <View className="flex-row items-center mt-2">
                <View className={`h-2 w-2 rounded-full mr-2 ${item.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                <Text className="text-xs text-gray-600">
                  {item.stock > 0 ? `${item.stock} units available` : 'Out of stock'}
                </Text>
              </View>
            </View>

            <TouchableOpacity className="p-2">
              <Feather name="edit-2" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}