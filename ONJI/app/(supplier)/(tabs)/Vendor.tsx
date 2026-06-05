import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, Pressable, ScrollView, StatusBar, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons, FontAwesome5, AntDesign, Ionicons } from '@expo/vector-icons';
import FavouriteModal from '../../../components/supplier/FavouriteModal';
import { secureStorage } from '@/lib/secureStorage';
import MyVendorCard from '../../../components/supplier/MyVendorCard';
import FindVendorCard from '@/components/supplier/FindVendorCard';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import axiosInstance from '../../../lib/api/axiosConfig';
import { localStorage } from '../../../lib/localStorage';
import {
  getSupplierConnectionStatus
} from '../../../lib/api/supplierConnection';

export interface INewSupplier {
  id: string;
  businessId: string;
  name: string;
  description: string;
  location: string;
  rating: number;
  reviews: number;
  credit: boolean;
}

/*

// Static mock data for "Find new Vendors" tab
const MOCK_ALL_VENDORS: INewSupplier[] = [
  { id: '1', businessId: 'b1', name: 'Sunway trading', description: 'Random kaka', location: '3 kms away, Udupi', rating: 4.5, reviews: 6, credit: false },
  { id: '2', businessId: 'b2', name: 'Sunway trading', description: 'Random kaka', location: '3 kms away, Udupi', rating: 4.5, reviews: 6, credit: false },
  { id: '3', businessId: 'b3', name: 'Sunway trading', description: 'Random kaka', location: '3 kms away, Udupi', rating: 4.5, reviews: 6, credit: true },
  { id: '4', businessId: 'b4', name: 'Sunway trading', description: 'Random kaka', location: '3 kms away, Udupi', rating: 4.5, reviews: 6, credit: false },
  { id: '5', businessId: 'b5', name: 'Sunway trading', description: 'Random kaka', location: '3 kms away, Udupi', rating: 4.5, reviews: 6, credit: false },
  { id: '6', businessId: 'b6', name: 'Sunway trading', description: 'Random kaka', location: '3 kms away, Udupi', rating: 4.5, reviews: 6, credit: true },
  { id: '7', businessId: 'b7', name: 'Sunway trading', description: 'Random kaka', location: '3 kms away, Udupi', rating: 4.5, reviews: 6, credit: false },
  { id: '8', businessId: 'b8', name: 'Sunway trading', description: 'Random kaka', location: '3 kms away, Udupi', rating: 4.5, reviews: 6, credit: false },
];

// Static mock data for "My Vendors" tab
const MOCK_MY_VENDORS: INewSupplier[] = [
  { id: 'm1', businessId: 'b1', name: 'Sunway trading', description: 'Random kaka', location: '3 kms away, Udupi', rating: 4.5, reviews: 6, credit: false },
  { id: 'm2', businessId: 'b2', name: 'Sunway trading', description: 'Random kaka', location: '3 kms away, Udupi', rating: 4.5, reviews: 6, credit: false },
  { id: 'm3', businessId: 'b3', name: 'Sunway trading', description: 'Random kaka', location: '3 kms away, Udupi', rating: 4.5, reviews: 6, credit: false },
  { id: 'm4', businessId: 'b4', name: 'Sunway trading', description: 'Random kaka', location: '3 kms away, Udupi', rating: 4.5, reviews: 6, credit: false },
  { id: 'm5', businessId: 'b5', name: 'Sunway trading', description: 'Random kaka', location: '3 kms away, Udupi', rating: 4.5, reviews: 6, credit: false },
  { id: 'm6', businessId: 'b6', name: 'Sunway trading', description: 'Random kaka', location: '3 kms away, Udupi', rating: 4.5, reviews: 6, credit: false },
];

*/

export default function Dashboard() {
  // Navigation State for the top tabs
  const [activeTab, setActiveTab] = useState<'find' | 'my'>('find');

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);
  const [selectedSort, setSelectedSort] = useState<string | null>(null);
  const [isFavouriteModalVisible, setIsFavouriteModalVisible] = useState(false);
  const [connectionStatuses, setConnectionStatuses] = useState<Record<string, string>>({});
  const [favouriteIds, setFavouriteIds] = useState<string[]>([]);

  useEffect(() => {
    const loadFavs = async () => {
      const savedFavs = await localStorage.getItem(
        'supplierFavouriteIds'
      );

      if (savedFavs) {
        setFavouriteIds(JSON.parse(savedFavs));
      }
    };

    loadFavs();
  }, []);

  const [myVendors, setMyVendors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [allVendors, setAllVendors] = useState<INewSupplier[]>([]);

  const fetchMyVendors = useCallback(async () => {
    try {
      setIsLoading(true);
      const supplierId = await secureStorage.getItem('userId');
      console.log("Supplier ID:", supplierId);
      if (!supplierId) return;
      const response = await axiosInstance.get(
        `/suppliers/${supplierId}/retailers`
      );
      /*const accepted = response.data.filter(
        (c: any) => c.status === 'ACCEPTED'
      );
      */
     console.log("API RESPONSE:", response.data);
     const accepted = response.data;

      console.log('MY VENDORS RESPONSE:', accepted);

      const mappedVendors = accepted.map((r: any) => ({
        id: r.id,
        businessId: '',
        name: r.fullName || 'Unknown',
        description: r.address || '',
        location: r.city || r.pincode || '',
        rating: 4.5,
        reviews: 6,
        credit: false,
      }));

      setMyVendors(mappedVendors);
      // mark fetched vendors as accepted in connectionStatuses
      setConnectionStatuses(prev => {
        const next = { ...prev } as Record<string, string>;

        accepted.forEach((s: any) => {
          const id =
            s.id ||
            s.retailerId ||
            s.supplierId ||
            s.supplier?.id;

          if (id) next[id] = 'ACCEPTED';
        });

        return next;
      });
    } catch (err) {
      console.log('Failed to fetch vendors:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAllVendors = useCallback(async () => {
  try {
    const response = await axiosInstance.get(
      '/api/retailer-business/all'
    );

    console.log('ALL VENDORS RESPONSE:', response.data);

    const vendors = response.data.map((r: any) => ({
      id: r.retailerId,
      businessId: r.businessId,
      name: r.name,
      description: r.address || '',
      location: r.city || '',
      rating: 4.5,
      reviews: 6,
      credit: false,
    }));

    const statuses: Record<string, string> = {};

    for (const vendor of vendors) {
      try {
        const status = await getSupplierConnectionStatus(vendor.id);

        console.log(
          'STATUS:',
          vendor.name,
          vendor.id,
          status
        );

        statuses[vendor.id] = status;
      } catch (err) {
        console.log(
          'STATUS ERROR:',
          vendor.name,
          vendor.id,
          err
        );

        statuses[vendor.id] = 'NONE';
      }
    }

    setConnectionStatuses(prev => ({
      ...prev,
      ...statuses,
    }));

    setAllVendors(vendors);

  } catch (err) {
    console.log('Failed to fetch retailers:', err);
  }
}, []);

  useFocusEffect(
  useCallback(() => {
    fetchMyVendors();
    fetchAllVendors();
  }, [fetchMyVendors, fetchAllVendors])
);

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

  const handleConnect = async (id: string) => {
      try {
        const current = (connectionStatuses[id] as any) || 'NONE';
        if (current === 'PENDING') {
    const { cancelSupplierConnectionRequest } =
      await import('../../../lib/api/supplierConnection');

    await cancelSupplierConnectionRequest(id);

    setConnectionStatuses(prev => ({ ...prev, [id]: 'NONE' }));
  } else if (current === 'NONE' || current === 'REJECTED') {
    const { sendSupplierConnectionRequest } =
      await import('../../../lib/api/supplierConnection');

    await sendSupplierConnectionRequest(id);

    setConnectionStatuses(prev => ({ ...prev, [id]: 'PENDING' }));
  }
      } catch (err) {
        console.log('Connection action failed', err);
      }
    };

  const handleToggleFav = async (id: string) => {
    const newFavs = favouriteIds.includes(id)
      ? favouriteIds.filter(fid => fid !== id)
      : [...favouriteIds, id];

    setFavouriteIds(newFavs);

    await localStorage.setItem(
      'supplierFavouriteIds',
      JSON.stringify(newFavs)
    );
  };

const favouriteSuppliers = allVendors.filter(
  s => favouriteIds.includes(s.id)
);

  // Decide which list to show based on the active tab
  const activeList = activeTab === 'find'
  ? allVendors
  : myVendors;

  // Filter the chosen list by search query
  const filteredSuppliers = activeTab === 'find'
  ? activeList.filter(s =>
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  : activeList;
  
  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <SafeAreaView className="bg-white">
        <View className="px-4 pt-2">
          
          {/* Top Tabs (Updated to switch states) */}
          <View className="bg-gray-100 rounded-lg p-1 mb-4">
            <View className="flex-row">
              <Pressable 
                className={`flex-1 py-2.5 px-4 rounded-md ${activeTab === 'find' ? 'bg-white shadow-sm' : ''}`}
                onPress={() => setActiveTab('find')}
              >
                <Text className={`text-center font-medium ${activeTab === 'find' ? 'text-green-600' : 'text-gray-500'}`}>
                  Find new Vendors
                </Text>
              </Pressable>
              <Pressable 
                className={`flex-1 py-2.5 px-4 rounded-md ${activeTab === 'my' ? 'bg-white shadow-sm' : ''}`}
                onPress={() => setActiveTab('my')}
              >
                <Text className={`text-center font-medium ${activeTab === 'my' ? 'text-green-600' : 'text-gray-500'}`}>
                  My Vendors
                </Text>
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
              <Pressable className="items-center" onPress={() => setIsFavouriteModalVisible(true)}>
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

      {/* Vendor List */}
      <FlatList
        data={filteredSuppliers}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) =>
          activeTab === 'find' ? (
            <FindVendorCard
              supplier={item}
              connectionStatus={connectionStatuses[item.id] || 'NONE'}
              isFavourite={favouriteIds.includes(item.id)}
              onConnect={handleConnect}
              onToggleFavourite={handleToggleFav}
            />
          ) : (
            <MyVendorCard
              supplier={item}
              isFavourite={favouriteIds.includes(item.id)}
              onToggleFavourite={handleToggleFav}
            />
          )
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ color: '#9CA3AF', fontSize: 16 }}>No vendors found</Text>
          </View>
        }
      />

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
            {/* Supplier Ratings Section */}
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
      {/* Favourite Modal */}
      <FavouriteModal
        visible={isFavouriteModalVisible}
        onClose={() => setIsFavouriteModalVisible(false)}
        favourites={favouriteSuppliers}
        connectionStatuses={connectionStatuses}
        onConnect={handleConnect}
      />
    </View>
  );
}

