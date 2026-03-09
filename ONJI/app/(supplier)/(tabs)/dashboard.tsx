import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';

// Types
interface Supplier {
  id: number;
  name: string;
  storeName: string;
  distance: string;
  rating: number;
  reviews: number;
  supplies: string[];
  avatar?: string;
}

interface SupplierCardProps {
  supplier: Supplier;
  isRequested: boolean;
  isFavorited: boolean;
  onConnect: (id: number) => void;
  onToggleFavorite: (id: number) => void;
  cardStyle?: any;
  showDistance?: boolean;
  showRating?: boolean;
  maxSupplies?: number;
}

// Reusable Components

// Stars Component
const Stars = ({ value }: { value: number }) => (
  <View style={{ flexDirection: 'row' }}>
    {Array.from({ length: Math.floor(value) }).map((_, i) => (
      <Feather key={i} name="star" size={12} color="#4ade80" />
    ))}
  </View>
);

// Reusable Supplier Card Component
const SupplierCard = ({
  supplier,
  isRequested,
  isFavorited,
  onConnect,
  onToggleFavorite,
  cardStyle = {},
  showDistance = true,
  showRating = true,
  maxSupplies = 2 // Reduced default to prevent overlap
}: SupplierCardProps) => {
  const isWeb = Platform.OS === 'web';

  return (
    <View style={[{
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      padding: 16,
      marginBottom: 16,
      flexDirection: 'row',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2
    }, cardStyle]}>
      
      {/* Avatar */}
      <Image
        source={
          supplier.avatar 
            ? { uri: supplier.avatar }
            : require('../../../assets/images/3davatar.png')
        }
        style={{
          width: isWeb ? 56 : 48,
          height: isWeb ? 56 : 48,
          borderRadius: isWeb ? 28 : 24,
          resizeMode: 'cover'
        }}
      />
      
      {/* Content */}
      <View style={{ flex: 1, marginLeft: 12 }}>
        
        {/* Header - Name and Favorite */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 4
        }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={{
              fontSize: isWeb ? 17 : 16,
              fontWeight: '600',
              color: '#1F2937'
            }}>
              {supplier.name}
            </Text>
            <Text style={{
              fontSize: isWeb ? 15 : 14,
              color: '#6B7280',
              marginTop: 1
            }}>
              {supplier.storeName}
            </Text>
          </View>
          <TouchableOpacity onPress={() => onToggleFavorite(supplier.id)}>
            <Feather
              name="heart"
              size={isWeb ? 20 : 18}
              color={isFavorited ? '#EF4444' : '#D1D5DB'}
              fill={isFavorited ? '#EF4444' : 'none'}
            />
          </TouchableOpacity>
        </View>

        {/* Distance */}
        {showDistance && (
          <Text style={{
            marginTop: 2,
            fontSize: isWeb ? 13 : 12,
            color: '#9CA3AF'
          }}>
            {supplier.distance}
          </Text>
        )}

        {/* Rating */}
        {showRating && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 8
          }}>
            <Stars value={supplier.rating} />
            <Text style={{
              marginLeft: 6,
              fontSize: isWeb ? 13 : 12,
              color: '#6B7280'
            }}>
              {supplier.rating} ({supplier.reviews})
            </Text>
          </View>
        )}

        {/* Supply Tags - Fixed to prevent overlap */}
        <View style={{
          marginTop: 12,
          marginBottom: 12
        }}>
          <View style={{ 
            flexDirection: 'row', 
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            {supplier.supplies.slice(0, maxSupplies).map((tag, i) => (
              <View
                key={i}
                style={{
                  backgroundColor: '#F0FDF4',
                  borderRadius: 12,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  marginRight: 8,
                  marginBottom: 4 // Add margin bottom for wrapped items
                }}>
                <Text style={{
                  fontSize: isWeb ? 11 : 10,
                  fontWeight: '500',
                  color: '#166534'
                }}>
                  {tag}
                </Text>
              </View>
            ))}
            {supplier.supplies.length > maxSupplies && (
              <View style={{
                backgroundColor: '#F3F4F6',
                borderRadius: 12,
                paddingHorizontal: 10,
                paddingVertical: 5,
                marginRight: 8,
                marginBottom: 4
              }}>
                <Text style={{
                  fontSize: isWeb ? 11 : 10,
                  fontWeight: '500',
                  color: '#6B7280'
                }}>
                  +{supplier.supplies.length - maxSupplies}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons - Separated from supply tags */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          alignItems: 'center'
        }}>
          {isRequested ? (
            <View style={{ 
              flexDirection: 'row', 
              gap: 8,
              flexShrink: 0 // Prevent shrinking
            }}>
              <TouchableOpacity style={{
                backgroundColor: '#2E7D32',
                borderRadius: 8,
                paddingHorizontal: isWeb ? 14 : 12,
                paddingVertical: isWeb ? 8 : 6,
                minWidth: isWeb ? 90 : 80 // Minimum width to prevent squishing
              }}>
                <Text style={{
                  color: '#FFFFFF',
                  fontSize: isWeb ? 12 : 11,
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  Requested
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onConnect(supplier.id)}
                style={{
                  borderWidth: 1,
                  borderColor: '#D1D5DB',
                  borderRadius: 8,
                  paddingHorizontal: isWeb ? 14 : 12,
                  paddingVertical: isWeb ? 8 : 6,
                  minWidth: isWeb ? 70 : 60
                }}>
                <Text style={{
                  color: '#6B7280',
                  fontSize: isWeb ? 12 : 11,
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => onConnect(supplier.id)}
              style={{
                backgroundColor: '#2E7D32',
                borderRadius: 8,
                paddingHorizontal: isWeb ? 16 : 14,
                paddingVertical: isWeb ? 10 : 8,
                minWidth: isWeb ? 80 : 70,
                flexShrink: 0
              }}>
              <Text style={{
                color: '#FFFFFF',
                fontSize: isWeb ? 13 : 12,
                fontWeight: '600',
                textAlign: 'center'
              }}>
                Connect
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

// Main Dashboard Component
export default function Dashboard() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';

  // dynamic measurements
  const horizontalPadding = 16;
  const availableWidth = width - horizontalPadding * 2;
  const tileSize = Math.min((availableWidth - 24) / 4, 60);

  // state
  const [search, setSearch] = useState('');
  const [connections, setConnections] = useState<Record<number, boolean>>({});
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});
  const [selectedAddress, setSelectedAddress] = useState('Mandavi palace');
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // dummy data
  const addresses = [
    { name: 'Mandavi palace', location: 'udupi, ambagullu 541011' },
    { name: 'Green Valley Store', location: 'mangalore, kadri 575003' },
    { name: 'City Center Market', location: 'bangalore, koramangala 560034' }
  ];

  const banners = [
    {
      title: 'Fresh from Farm to You',
      image: require('../../../assets/images/fresh.jpg'),
      description: 'Sourced daily from trusted local farms'
    },
    {
      title: 'Fresh Vegetables',
      image: require('../../../assets/images/vegi.jpg'),
      description: 'Sourced daily from trusted local farms with guaranteed freshness'
    },
    {
      title: 'Direct from Farms',
      image: require('../../../assets/images/farms.jpg'),
      description: 'Connect directly with farmers for the freshest produce'
    },
  ];

  const suppliers: Supplier[] = [
    {
      id: 1,
      name: 'Sunway Trading',
      storeName: 'Random Kaka',
      distance: '3 kms away, Mangalore',
      rating: 4.5,
      reviews: 6,
      supplies: ['Vegetables', 'Fruits']
    },
    {
      id: 2,
      name: 'Green Valley Farms',
      storeName: 'Fresh Market',
      distance: '5 kms away, Udupi',
      rating: 4.8,
      reviews: 12,
      supplies: ['Vegetables', 'Herbs']
    },
    {
      id: 3,
      name: 'Coastal Suppliers',
      storeName: 'Ocean Fresh',
      distance: '2 kms away, Mangalore',
      rating: 4.2,
      reviews: 8,
      supplies: ['Vegetables', 'Seafood']
    },
    {
      id: 4,
      name: 'Mountain Fresh',
      storeName: 'Hill Station Store',
      distance: '7 kms away, Dharwad',
      rating: 4.6,
      reviews: 15,
      supplies: ['Fruits', 'Vegetables', 'Dairy']
    }
  ];

  // Navigation
  const handleTilePress = (tileLabel: string) => {
    try {
      switch (tileLabel) {
        case 'My Suppliers':
          router.push('/inventory');
          break;
        case 'Credit':
          router.push('/invoice');
          break;
        case 'Orders':
          router.push('/cart');
          break;
        case 'Saved Items':
          break;
        default:
          console.log(`Navigation not implemented for: ${tileLabel}`);
          break;
      }
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Unable to navigate to the requested screen.');
    }
  };

  const toggleConnection = (id: number) =>
    setConnections(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleFavorite = (id: number) =>
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));

  // Filter suppliers based on search
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(search.toLowerCase()) ||
    supplier.storeName.toLowerCase().includes(search.toLowerCase()) ||
    supplier.supplies.some(supply => supply.toLowerCase().includes(search.toLowerCase()))
  );

  const currentAddress = addresses.find(addr => addr.name === selectedAddress) || addresses[0];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      <View
        style={{
          paddingHorizontal: horizontalPadding,
          paddingTop: isWeb ? 20 : 12,
          paddingBottom: 8,
          backgroundColor: '#FFFFFF',
          zIndex: 10,
          position: 'relative'
        }}>

        {/* Decorative Image */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: -10,
            right: 0,
            width: 180,
            height: 180,
            opacity: 0.6,
            zIndex: 1
          }}>
          <Image
            source={require('../../../assets/images/topimg.png')}
            style={{
              width: '100%',
              height: '100%',
              resizeMode: 'contain'
            }}
          />
        </View>

        {/* Address & Icons */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', zIndex: 2 }}>
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              onPress={() => setShowAddressDropdown(!showAddressDropdown)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 4
              }}>
              <Text style={{
                fontSize: isWeb ? 22 : 20,
                fontWeight: '700',
                color: '#1F2937',
                marginRight: 8
              }}>
                {currentAddress.name}
              </Text>
              <Feather
                name={showAddressDropdown ? "chevron-up" : "chevron-down"}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>

            <Text style={{
              fontSize: isWeb ? 14 : 13,
              color: '#6B7280',
              marginBottom: 2
            }}>
              {currentAddress.location}
            </Text>

            {/* Address Dropdown */}
            {showAddressDropdown && (
              <View style={{
                position: 'absolute',
                top: 60,
                left: 0,
                right: 0,
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#E5E7EB',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 8,
                zIndex: 20
              }}>
                {addresses.map((addr, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setSelectedAddress(addr.name);
                      setShowAddressDropdown(false);
                    }}
                    style={{
                      padding: 16,
                      borderBottomWidth: index < addresses.length - 1 ? 1 : 0,
                      borderBottomColor: '#F3F4F6'
                    }}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: addr.name === selectedAddress ? '600' : '400',
                      color: addr.name === selectedAddress ? '#059669' : '#1F2937'
                    }}>
                      {addr.name}
                    </Text>
                    <Text style={{
                      fontSize: 12,
                      color: '#6B7280',
                      marginTop: 2
                    }}>
                      {addr.location}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Icons */}
          <View style={{ flexDirection: 'row', marginLeft: 12, zIndex: 3 }}>
            <TouchableOpacity style={{
              width: isWeb ? 44 : 40,
              height: isWeb ? 44 : 40,
              borderRadius: isWeb ? 22 : 20,
              backgroundColor: '#F3F4F6',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 8
            }}>
              <Ionicons name="notifications-outline" size={isWeb ? 24 : 20} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity style={{
              width: isWeb ? 44 : 40,
              height: isWeb ? 44 : 40,
              borderRadius: isWeb ? 22 : 20,
              backgroundColor: '#F3F4F6',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Ionicons name="person-outline" size={isWeb ? 24 : 20} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* SEARCH BAR */}
      <View style={{
        paddingHorizontal: horizontalPadding,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        zIndex: 9
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#F9FAFB',
          borderRadius: 25,
          borderWidth: 1,
          borderColor: '#E5E7EB',
          paddingHorizontal: 16,
          paddingVertical: isWeb ? 14 : 12
        }}>
          <Feather name="search" size={isWeb ? 20 : 18} color="#9CA3AF" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search suppliers..."
            placeholderTextColor="#9CA3AF"
            style={{
              marginLeft: 12,
              flex: 1,
              fontSize: isWeb ? 16 : 15,
              color: '#1F2937'
            }}
          />
        </View>
      </View>

      {/* SCROLLABLE CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        style={{ flex: 1, zIndex: 1 }}>

        {/* BANNER SECTION - CENTERED TEXT AND BUTTON AT BOTTOM */}
        <View style={{
          marginHorizontal: horizontalPadding,
          marginTop: 16,
          marginBottom: 24,
          position: 'relative'
        }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            decelerationRate="fast"
            snapToInterval={availableWidth}
            snapToAlignment="start"
            onScroll={(event) => {
              const slideIndex = Math.round(event.nativeEvent.contentOffset.x / availableWidth);
              if (slideIndex !== currentBannerIndex) {
                setCurrentBannerIndex(slideIndex);
              }
            }}
            scrollEventThrottle={16}
            style={{ borderRadius: 20 }}
          >
            {banners.map((banner, index) => (
              <View
                key={index}
                style={{
                  width: availableWidth,
                  borderRadius: 20,
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                
                {/* Banner Image Background with centered text at bottom */}
                <ImageBackground
                  source={banner.image}
                  style={{
                    width: '100%',
                    height: 220,
                    justifyContent: 'flex-end', // Push content to bottom
                    alignItems: 'center', // Center content horizontally
                  }}
                  imageStyle={{
                    resizeMode: 'cover',
                    borderRadius: 20
                  }}
                >
                  {/* Dark overlay for better text readability */}
                  <View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    borderRadius: 20
                  }} />
                  
                  {/* Centered Text Content at Bottom of Image */}
                  <View style={{ 
                    zIndex: 2,
                    alignItems: 'center', // Center all text and button
                    paddingHorizontal: 20,
                    paddingBottom: 0, // Bottom padding for spacing from edge
                    width: '100%'
                  }}>
                    <Text style={{
                      fontSize: 20,
                      fontWeight: '700',
                      color: '#FFFFFF',
                      marginBottom: 10,
                      textAlign: 'center', // Center align title
                      textShadowColor: 'rgba(0, 0, 0, 0.8)',
                      textShadowOffset: { width: 1, height: 2 },
                      textShadowRadius: 4,
                      lineHeight: 24
                    }}>
                      {banner.title}
                    </Text>
                    
                    <Text style={{
                      fontSize: 13,
                      color: '#FFFFFF',
                      marginBottom: 10,
                      textAlign: 'center', // Center align description
                      opacity: 0.95,
                      textShadowColor: 'rgba(0, 0, 0, 0.7)',
                      textShadowOffset: { width: 1, height: 1 },
                      textShadowRadius: 3,
                      lineHeight: 18,
                      maxWidth: '90%' // Limit width for better readability
                    }}>
                      {banner.description}
                    </Text>
                    
                    {/* Centered Button with exact specifications */}
                    <TouchableOpacity 
                      style={{
                        backgroundColor: '#2E7D32',
                        width: 160, // Exact width as specified
                        height: 40, // Exact height as specified
                        paddingTop: 6, // Exact padding as specified
                        paddingRight: 16,
                        paddingBottom: 6,
                        paddingLeft: 16,
                        borderRadius: 80,
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 4
                      }}
                      onPress={() => {
                        console.log('Shop for fresh produce clicked - Banner:', banner.title);
                        // Add your navigation logic here
                      }}
                    >
                      <Text style={{
                        color: '#FFFFFF',
                        fontSize: 12, // Smaller font to fit in 30px height
                        fontWeight: '500',
                        textAlign: 'center'
                      }}>
                        Shop for fresh produce
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ImageBackground>
              </View>
            ))}
          </ScrollView>

          {/* Working Page Indicators */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 16,
            paddingHorizontal: 20
          }}>
            {banners.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setCurrentBannerIndex(index);
                }}
                style={{
                  width: index === currentBannerIndex ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: index === currentBannerIndex ? '#2E7D32' : '#D1D5DB',
                  marginHorizontal: 3,
                }}
              />
            ))}
          </View>
        </View>

        {/* MANAGE STORE SECTION */}
        <View style={{ paddingHorizontal: horizontalPadding, marginBottom: 24 }}>
          <Text style={{
            fontSize: isWeb ? 20 : 18,
            fontWeight: '600',
            color: '#1F2937',
            marginBottom: 16
          }}>
            Manage your store
          </Text>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}>
            {[
              {
                label: 'My Suppliers',
                value: '20',
                bg: '#DCFCE7',
                icon: <MaterialCommunityIcons name="account-group" size={isWeb ? 22 : 20} color="#10B981" />
              },
              {
                label: 'Orders',
                value: '4 active orders',
                bg: '#E9D5FF',
                icon: <Feather name="shopping-bag" size={isWeb ? 22 : 20} color="#7C3AED" />
              },
              {
                label: 'Credit',
                value: '3 active credits',
                bg: '#FEF3C7',
                icon: <MaterialCommunityIcons name="credit-card-outline" size={isWeb ? 22 : 20} color="#CA8A04" />
              },
              {
                label: 'Saved Items',
                value: '',
                bg: '#FECACA',
                icon: <MaterialCommunityIcons name="fruit-grapes" size={isWeb ? 22 : 20} color="#E11D48" />
              },
            ].map((tile, index) => (
              <View key={index} style={{ alignItems: 'center', flex: 1 }}>
                <TouchableOpacity
                  style={{
                    width: tileSize,
                    height: tileSize,
                    borderRadius: 16,
                    backgroundColor: tile.bg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3
                  }}
                  activeOpacity={0.7}
                  onPress={() => handleTilePress(tile.label)}>
                  {tile.icon}
                </TouchableOpacity>
                <Text style={{
                  fontSize: isWeb ? 11 : 10,
                  color: '#6B7280',
                  textAlign: 'center',
                  marginBottom: 2
                }}>
                  {tile.label}
                </Text>
                {tile.value ? (
                  <Text style={{
                    fontSize: isWeb ? 13 : 12,
                    fontWeight: '600',
                    color: '#1F2937',
                    textAlign: 'center'
                  }}>
                    {tile.value}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        </View>

        {/* DISCOVER SUPPLIERS SECTION - Using Reusable Component */}
        <View style={{
          paddingHorizontal: horizontalPadding,
          marginBottom: 24
        }}>
          <Text style={{
            fontSize: isWeb ? 20 : 18,
            fontWeight: '600',
            color: '#1F2937',
            marginBottom: 16
          }}>
            Discover Suppliers ({filteredSuppliers.length})
          </Text>

          {filteredSuppliers.length === 0 ? (
            <View style={{ 
              alignItems: 'center', 
              paddingVertical: 40 
            }}>
              <Text style={{ 
                color: '#6B7280', 
                fontSize: 16 
              }}>
                {search ? 'No suppliers found for your search' : 'No suppliers available'}
              </Text>
            </View>
          ) : (
            filteredSuppliers.map(supplier => {
              const requested = !!connections[supplier.id];
              const favored = !!favorites[supplier.id];

              return (
                <SupplierCard
                  key={supplier.id}
                  supplier={supplier}
                  isRequested={requested}
                  isFavorited={favored}
                  onConnect={toggleConnection}
                  onToggleFavorite={toggleFavorite}
                  showDistance={true}
                  showRating={true}
                  maxSupplies={2} // Reduced to prevent overlap
                />
              );
            })
          )}

          {filteredSuppliers.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                try {
                  router.push('/inventory');
                } catch (error) {
                  console.error('Navigation error:', error);
                }
              }}
              style={{
                alignSelf: 'center',
                marginTop: 8,
                paddingVertical: isWeb ? 14 : 12,
                paddingHorizontal: isWeb ? 28 : 24,
                borderWidth: 1,
                borderColor: '#D1D5DB',
                borderRadius: 10
              }}>
              <Text style={{
                fontSize: isWeb ? 15 : 14,
                fontWeight: '600',
                color: '#374151'
              }}>
                View all suppliers →
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
