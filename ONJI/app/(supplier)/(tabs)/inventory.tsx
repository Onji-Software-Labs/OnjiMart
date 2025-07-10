import React, { useState } from 'react';
import { Text, View, TextInput, Pressable, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { Feather, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const filterChips = [
    { id: 'location', label: 'Udupi' },
    { id: 'distance', label: 'within 10km' },
    { id: 'fruits', label: 'Fruits' },
    { id: 'vegetable', label: 'Vegetable' },
    { id: 'previously', label: 'Previously' },
  ];

  const handleFilterPress = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId)
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    // TODO: Implement real-time search functionality
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <SafeAreaView className="bg-white">
        <View className="px-4 pt-2">
          {/* Tab Navigation in Grey Container */}
          <View className="bg-gray-200 rounded-lg p-1 mb-4">
            <View className="flex-row">
              <Pressable className="flex-1 py-3 px-4 bg-white rounded-md shadow-sm">
                <Text className="text-center text-green-600 font-medium">
                  Find new suppliers
                </Text>
              </Pressable>
              <Pressable className="flex-1 py-3 px-4">
                <Text className="text-center text-gray-600 font-medium">
                  My Suppliers
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Search Bar and Actions */}
          <View className="flex-row items-center justify-between mb-4">
            {/* Search Bar - Reduced width */}
            <View className="relative flex-1 mr-4">
              <TextInput
                className="bg-gray-100 h-12 px-4 pr-12 rounded-lg text-gray-700"
                placeholder="Search 'Random kaka'"
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={handleSearch}
              />
              <Pressable className="absolute right-3 top-3">
                <Feather name="search" size={20} color="#9CA3AF" />
              </Pressable>
            </View>

            {/* Filter Actions */}
            <View className="flex-row items-center space-x-6">
              <Pressable className="items-center">
                <Feather name="filter" size={20} color="#6B7280" />
                <Text className="text-xs text-gray-500 mt-1">Filter</Text>
              </Pressable>
              <Pressable className="items-center">
                <MaterialCommunityIcons name="sort" size={20} color="#6B7280" />
                <Text className="text-xs text-gray-500 mt-1">Sort</Text>
              </Pressable>
              <Pressable className="items-center">
                <FontAwesome5 name="heart" size={18} color="#9CA3AF" />
                <Text className="text-xs text-gray-500 mt-1">Favourite</Text>
              </Pressable>
            </View>
          </View>

          {/* Horizontal line after search bar */}
          <View className="h-px bg-gray-200 mb-4" />

          {/* Filter Chips */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="mb-4"
          >
            <View className="flex-row space-x-2">
              {/* Location with icon - not clickable */}
              <View className="flex-row items-center">
                <View className="flex-row items-center px-2 py-2">
                  <Feather name="map-pin" size={16} color="#6B7280" />
                  <Text className="ml-2 text-gray-700 font-bold underline">
                    Udupi
                  </Text>
                </View>
                {/* Vertical line after Udupi */}
                <View className="w-px h-6 bg-gray-300 mx-2" />
              </View>
              
              {/* Other filter chips */}
              {filterChips.slice(1).map((chip) => (
                <Pressable
                  key={chip.id}
                  onPress={() => handleFilterPress(chip.id)}
                  className={`px-4 py-2 rounded-full border ${
                    selectedFilters.includes(chip.id)
                      ? 'bg-purple-500 border-purple-500'
                      : 'bg-white border-purple-500'
                  }`}
                >
                  <Text
                    className={`${
                      selectedFilters.includes(chip.id)
                        ? 'text-white'
                        : 'text-purple-500'
                    }`}
                  >
                    {chip.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Horizontal line after filter chips */}
          <View className="h-px bg-gray-200 mb-4" />
        </View>
      </SafeAreaView>

      {/* Content Area - Empty for now */}
      <ScrollView className="flex-1 px-4">
        <View className="flex-1 items-center justify-center py-20">
          <Text className="text-gray-400 text-lg">
            Search results will appear here
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
