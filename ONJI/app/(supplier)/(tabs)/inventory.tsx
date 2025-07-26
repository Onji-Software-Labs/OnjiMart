import React, { useState } from 'react';
import { Text, View, TextInput, Pressable, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons, FontAwesome5, AntDesign } from '@expo/vector-icons';

export default function Dashboard() {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);
  const [selectedSort, setSelectedSort] = useState<string | null>(null);
  
  // Filter state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [creditProvided, setCreditProvided] = useState<'yes' | 'no' | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState<string>('');

  // Constants
  const categories = ['Fruits', 'Vegetable', 'Premium', 'Seasonal'];
  const quantities = ['20 kg', '50 kg', '100kg', '200kg', '500+ kg'];
  const filterChips = [
    { id: 'location', label: 'Udupi' },
    { id: 'distance', label: 'within 10km' },
    { id: 'fruits', label: 'Fruits' },
    { id: 'vegetable', label: 'Vegetable' },
    { id: 'previously', label: 'Previously' },
  ];

  // Handlers
  const handleFilterPress = (filterId: string) => {
    setSelectedFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const handleSearch = (text: string) => setSearchQuery(text);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setCreditProvided(null);
    setSelectedFilters([]);
    setSelectedQuantity('');
  };

  const applyFilters = () => {
    setIsFilterModalVisible(false);
  };

  const hasActiveFilters = selectedCategories.length > 0 || creditProvided !== null || selectedFilters.length > 0 || selectedQuantity !== '';

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <SafeAreaView className="bg-white">
        <View className="px-4 pt-2">
          {/* Top Tabs */}
          <View className="bg-gray-200 rounded-lg p-1 mb-4">
            <View className="flex-row">
              <Pressable className="flex-1 py-3 px-4 bg-white rounded-md shadow-sm">
                <Text className="text-center text-green-600 font-medium">Find new suppliers</Text>
              </Pressable>
              <Pressable className="flex-1 py-3 px-4">
                <Text className="text-center text-gray-600 font-medium">My Suppliers</Text>
              </Pressable>
            </View>
          </View>
          {/* Search & Actions */}
          <View className="flex-row items-center justify-between mb-4">
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
            <View className="flex-row items-center space-x-6">
              <Pressable 
                className={`items-center p-2 rounded-lg ${isFilterModalVisible || hasActiveFilters ? 'border-2 border-green-500 bg-green-50' : ''}`}
                onPress={() => {
                  setIsFilterModalVisible(true);
                  setIsSortModalVisible(false);
                }}
              >
                <Feather name="filter" size={20} color={isFilterModalVisible || hasActiveFilters ? "#10B981" : "#6B7280"} />
                <Text className={`text-xs mt-1 ${isFilterModalVisible || hasActiveFilters ? 'text-green-600 font-medium' : 'text-gray-500'}`}>Filter</Text>
              </Pressable>
              <Pressable 
                className={`items-center p-2 rounded-lg ${isSortModalVisible || selectedSort ? 'border-2 border-green-500 bg-green-50' : ''}`}
                onPress={() => {
                  setIsSortModalVisible(true);
                  setIsFilterModalVisible(false);
                }}
              >
                <MaterialCommunityIcons name="sort" size={20} color={isSortModalVisible || selectedSort ? "#10B981" : "#6B7280"} />
                <Text className={`text-xs mt-1 ${isSortModalVisible || selectedSort ? 'text-green-600 font-medium' : 'text-gray-500'}`}>Sort</Text>
              </Pressable>
              <Pressable className="items-center">
                <FontAwesome5 name="heart" size={18} color="#9CA3AF" />
                <Text className="text-xs text-gray-500 mt-1">Favourite</Text>
              </Pressable>
            </View>
          </View>
          <View className="h-px bg-gray-200 mb-4" />
          {/* Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row space-x-2">
              <View className="flex-row items-center">
                <View className="flex-row items-center px-2 py-2">
                  <Feather name="map-pin" size={16} color="#6B7280" />
                  <Text className="ml-2 text-gray-700 font-bold underline">Udupi</Text>
                </View>
                <View className="w-px h-6 bg-gray-300 mx-2" />
              </View>
              {filterChips.slice(1).map((chip) => (
                <Pressable
                  key={chip.id}
                  onPress={() => handleFilterPress(chip.id)}
                  className={`px-4 py-2 rounded-full border ${selectedFilters.includes(chip.id) ? 'bg-purple-500 border-purple-500' : 'bg-white border-purple-500'}`}
                >
                  <Text className={`${selectedFilters.includes(chip.id) ? 'text-white' : 'text-purple-500'}`}>{chip.label}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          <View className="h-px bg-gray-200 mb-4" />
        </View>
      </SafeAreaView>
      {/* Content Area */}
      <ScrollView className="flex-1 px-4">
        <View className="flex-1 items-center justify-center py-20">
          <Text className="text-gray-400 text-lg">Search results will appear here</Text>
        </View>
      </ScrollView>

      {/* Filter Modal */}
      {isFilterModalVisible && !isSortModalVisible && (
        <View style={{ position: 'absolute', top: 120, left: 0, right: 0, bottom: 0, backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 10, zIndex: 10 }}>
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
            <Text className="text-xl font-semibold text-green-600">Filter</Text>
            <TouchableOpacity onPress={() => setIsFilterModalVisible(false)}>
              <AntDesign name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
            {/* Category Section */}
            <View className="mb-6">
              <Text className="text-base font-medium text-gray-800 mb-4">Category</Text>
              <View className="flex-row flex-wrap">
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => handleCategoryToggle(category)}
                    className={`mr-3 mb-3 px-4 py-2 rounded-full border ${selectedCategories.includes(category) ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}`}
                  >
                    <Text className={`text-sm ${selectedCategories.includes(category) ? 'text-white' : 'text-gray-600'}`}>{category}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {/* Credit Provided Section */}
            <View className="mb-6">
              <Text className="text-base font-medium text-gray-800 mb-4">Credit Provided</Text>
              <View className="flex-row">
                <TouchableOpacity onPress={() => setCreditProvided('yes')} className="flex-row items-center mr-8">
                  <View className={`w-4 h-4 border-2 mr-3 ${creditProvided === 'yes' ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>{creditProvided === 'yes' && (<AntDesign name="check" size={10} color="white" />)}</View>
                  <Text className="text-base text-gray-700">Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setCreditProvided('no')} className="flex-row items-center">
                  <View className={`w-4 h-4 border-2 mr-3 ${creditProvided === 'no' ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>{creditProvided === 'no' && (<AntDesign name="check" size={10} color="white" />)}</View>
                  <Text className="text-base text-gray-700">No</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* Distance Section - Location Chips */}
            <View className="mb-6">
              <Text className="text-base font-medium text-gray-800 mb-4">Distance</Text>
              <View className="flex-row flex-wrap">
                {['Within your city', 'Mangalore', 'kundapur', 'All'].map((location) => (
                  <TouchableOpacity
                    key={location}
                    onPress={() => {
                      setSelectedFilters(prev => prev.includes(location) ? prev.filter(l => l !== location) : [...prev, location]);
                    }}
                    className={`mr-3 mb-3 px-4 py-2 rounded-full border ${selectedFilters.includes(location) ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}`}
                  >
                    <Text className={`text-sm ${selectedFilters.includes(location) ? 'text-white' : 'text-gray-600'}`}>{location}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {/* Supplier Ratings Section - Multi-select Chips */}
            <View className="mb-6">
              <Text className="text-base font-medium text-gray-800 mb-4">Supplier Ratings</Text>
              <View className="flex-row flex-wrap">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    onPress={() => {
                      setSelectedFilters(prev => prev.includes(`${rating}★`) ? prev.filter(r => r !== `${rating}★`) : [...prev, `${rating}★`]);
                    }}
                    className={`mr-3 mb-3 px-4 py-2 rounded-full border ${selectedFilters.includes(`${rating}★`) ? 'bg-yellow-400 border-yellow-400' : 'bg-white border-gray-300'}`}
                  >
                    <Text className={`text-sm ${selectedFilters.includes(`${rating}★`) ? 'text-white' : 'text-gray-600'}`}>{rating} ★</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {/* Minimum Quantity Section */}
            <View className="mb-8">
              <Text className="text-base font-medium text-gray-800 mb-2">Minimum Quantity</Text>
              <Text className="text-sm text-gray-500 mb-4">Up to</Text>
              <View className="flex-row flex-wrap">
                {quantities.map((quantity) => (
                  <TouchableOpacity
                    key={quantity}
                    onPress={() => setSelectedQuantity(quantity)}
                    className={`mr-3 mb-3 px-4 py-2 rounded-full border ${selectedQuantity === quantity ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}`}
                  >
                    <Text className={`text-sm ${selectedQuantity === quantity ? 'text-white' : 'text-gray-600'}`}>{quantity}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
          {/* Modal Footer */}
          <View className="px-4 py-4 border-t border-gray-200">
            <View className="flex-row space-x-4">
              <TouchableOpacity onPress={resetFilters} className="flex-1 py-3 px-4 border border-green-500 rounded-lg">
                <Text className="text-center text-green-500 font-medium text-base">Reset Filter</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={applyFilters} className="flex-1 py-3 px-4 bg-green-500 rounded-lg">
                <Text className="text-center text-white font-medium text-base">Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Sort Modal */}
      {isSortModalVisible && !isFilterModalVisible && (
        <View style={{ position: 'absolute', top: 120, left: 0, right: 0, bottom: 0, backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 10, zIndex: 10 }}>
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
            <Text className="text-xl font-semibold text-green-600">Sort</Text>
            <TouchableOpacity onPress={() => setIsSortModalVisible(false)}>
              <AntDesign name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <View className="px-4 py-6">
            {['Recommended', 'Newest', 'Credit: High to Low', 'Credit: Low to High'].map(option => (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  setSelectedSort(selectedSort === option ? null : option);
                }}
                className="flex-row items-center justify-between mb-6"
              >
                <Text className="text-lg text-gray-800">{option}</Text>
                <View className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedSort === option ? 'border-green-500' : 'border-gray-300'}`} style={{ backgroundColor: selectedSort === option ? '#E8F5E8' : 'white' }}>
                  {selectedSort === option && (<View className="w-3 h-3 rounded-full bg-green-500" />)}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
