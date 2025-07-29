/* app/(supplier)/(tabs)/dashboard.tsx */
import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  ImageBackground,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  Alert
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function Dashboard() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';

  // dynamic measurements
  const horizontalPadding = 16;
  const availableWidth = width - horizontalPadding * 2;
  const bannerWidth = Math.min(availableWidth * 0.9, 320);
  const bannerImageHeight = 120;
  const tileSize = Math.min((availableWidth - 24) / 4, 60);

  // state
  const [search, setSearch] = useState('');
  const [connections, setConnections] = useState<Record<number, boolean>>({});
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});
  const [selectedAddress, setSelectedAddress] = useState('Mandavi palace');
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);

  // dummy data
  const addresses = [
    { name: 'Mandavi palace', location: 'udupi, ambagullu 541011' },
    { name: 'Green Valley Store', location: 'mangalore, kadri 575003' },
    { name: 'City Center Market', location: 'bangalore, koramangala 560034' }
  ];

  const banners = [
    { title: 'Fresh Vegetables', image: require('../../../assets/images/vegi.jpg') },
    { title: 'Fresh from Farm to You', image: require('../../../assets/images/fresh.jpg') },
    { title: 'Direct from Farms', image: require('../../../assets/images/farms.jpg') },
  ];

  const suppliers = Array.from({ length: 4 }, (_, i) => ({
    id: i + 1,
    name: 'Sunway trading',
    storeName: 'Random kaka',
    distance: '3 kms away, Mangalore',
    rating: 4.5,
    reviews: 6,
    supplies: ['Vegetables']
  }));

  // Navigation handlers with correct file paths
  const handleTilePress = (tileLabel: string) => {
    try {
      switch (tileLabel) {
        case 'My suppliers':
          // Navigate to inventory.tsx (which is My Suppliers)
          router.push('/inventory');
          break;
        case 'Credit':
          // Navigate to Invoice screen
          router.push('/invoice');
          break;
        case 'Orders':
          // Navigate to Cart tab
          router.push('/cart');
          break;
        case 'Saved items':
          // Navigate to Saved Items screen
       //   router.push('/(supplier)/saved');
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

  const Stars = ({ value }: { value: number }) => (
    <View style={{ flexDirection: 'row' }}>
      {Array.from({ length: Math.floor(value) }).map((_, i) => (
        <Feather key={i} name="star" size={12} color="#4ade80" />
      ))}
    </View>
  );

  const currentAddress = addresses.find(addr => addr.name === selectedAddress) || addresses[0];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER with Address Dropdown and Top Image */}
      <View
        style={{
          paddingHorizontal: horizontalPadding,
          paddingTop: isWeb ? 20 : 12,
          paddingBottom: 8,
          backgroundColor: '#FFFFFF',
          zIndex: 10,
          position: 'relative'
        }}>
        
        {/* TOP DECORATIVE IMAGE */}
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
            placeholder="Search: Random kaka"
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

        {/* FEATURED BANNER */}
        <View style={{
          marginHorizontal: horizontalPadding,
          marginTop: 16,
          marginBottom: 24,
          borderRadius: 20,
          overflow: 'hidden',
          minHeight: 240,
          position: 'relative'
        }}>
          <ImageBackground
            source={require('../../../assets/images/homebg.jpg')}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 20
            }}
            imageStyle={{ 
              resizeMode: 'repeat',
              borderRadius: 20,
              opacity: 0.6
            }}
          />

          <View style={{
            flex: 1,
            paddingTop: 20,
            paddingRight: 10,
            paddingBottom: 20,
            paddingLeft: 10,
            justifyContent: 'center'
          }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}
            >
              {banners.map((banner, index) => (
                <View
                  key={index}
                  style={{
                    width: bannerWidth,
                    marginRight: index < banners.length - 1 ? 20 : 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: 20,
                    padding: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.2,
                    shadowRadius: 12,
                    elevation: 8
                  }}>
                  <Image
                    source={banner.image}
                    style={{
                      width: bannerWidth - 40,
                      height: bannerImageHeight,
                      borderRadius: 16,
                      resizeMode: 'cover',
                      marginBottom: 16
                    }}
                  />
                  <Text style={{
                    fontSize: isWeb ? 20 : 18,
                    fontWeight: '700',
                    color: '#1F2937',
                    marginBottom: 8,
                    lineHeight: isWeb ? 24 : 22
                  }}>
                    {banner.title}
                  </Text>
                  <Text style={{
                    fontSize: isWeb ? 15 : 14,
                    color: '#6B7280',
                    lineHeight: 20,
                    marginBottom: 16
                  }}>
                    Sourced daily from trusted local farms
                  </Text>
                  <TouchableOpacity style={{
                    backgroundColor: '#059669',
                    paddingVertical: isWeb ? 14 : 12,
                    borderRadius: 16,
                    shadowColor: '#059669',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 4
                  }}>
                    <Text style={{
                      color: '#FFFFFF',
                      textAlign: 'center',
                      fontSize: isWeb ? 16 : 14,
                      fontWeight: '700'
                    }}>
                      Shop for fresh produce
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
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
                label: 'My suppliers', 
                value: '26', 
                bg: '#DCFCE7', 
                icon: <MaterialCommunityIcons name="account-group" size={isWeb ? 22 : 20} color="#10B981" /> 
              },
              { 
                label: 'Credit', 
                value: '3 active credits', 
                bg: '#FEF3C7', 
                icon: <MaterialCommunityIcons name="credit-card-outline" size={isWeb ? 22 : 20} color="#CA8A04" /> 
              },
              { 
                label: 'Orders', 
                value: '', 
                bg: '#E9D5FF', 
                icon: <Feather name="shopping-bag" size={isWeb ? 22 : 20} color="#7C3AED" /> 
              },
              { 
                label: 'Saved items', 
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

        {/* DISCOVER SUPPLIERS SECTION */}
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
            Discover Suppliers
          </Text>

          {suppliers.map(supplier => {
            const requested = !!connections[supplier.id];
            const favored = !!favorites[supplier.id];
            
            return (
              <View key={supplier.id} style={{
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
              }}>
                <Image
                  source={require('../../../assets/images/3davatar.png')}
                  style={{
                    width: isWeb ? 56 : 48,
                    height: isWeb ? 56 : 48,
                    borderRadius: isWeb ? 28 : 24,
                    resizeMode: 'cover'
                  }}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 4
                  }}>
                    <View>
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
                    <TouchableOpacity onPress={() => toggleFavorite(supplier.id)}>
                      <Feather
                        name="heart"
                        size={isWeb ? 20 : 18}
                        color={favored ? '#EF4444' : '#D1D5DB'}
                        fill={favored ? '#EF4444' : 'none'}
                      />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={{ 
                    marginTop: 2, 
                    fontSize: isWeb ? 13 : 12, 
                    color: '#9CA3AF' 
                  }}>
                    {supplier.distance}
                  </Text>
                  
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
                  
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 12
                  }}>
                    <View style={{ flexDirection: 'row' }}>
                      {supplier.supplies.map((tag, i) => (
                        <View
                          key={i}
                          style={{
                            backgroundColor: '#F0FDF4',
                            borderRadius: 12,
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            marginRight: 8
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
                    </View>
                    
                    {requested ? (
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity style={{
                          backgroundColor: '#059669',
                          borderRadius: 8,
                          paddingHorizontal: isWeb ? 16 : 14,
                          paddingVertical: isWeb ? 10 : 8
                        }}>
                          <Text style={{
                            color: '#FFFFFF',
                            fontSize: isWeb ? 13 : 12,
                            fontWeight: '600'
                          }}>
                            Requested
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => toggleConnection(supplier.id)}
                          style={{
                            borderWidth: 1,
                            borderColor: '#D1D5DB',
                            borderRadius: 8,
                            paddingHorizontal: isWeb ? 16 : 14,
                            paddingVertical: isWeb ? 10 : 8
                          }}>
                          <Text style={{
                            color: '#6B7280',
                            fontSize: isWeb ? 13 : 12,
                            fontWeight: '600'
                          }}>
                            Cancel
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => toggleConnection(supplier.id)}
                        style={{
                          backgroundColor: '#059669',
                          borderRadius: 8,
                          paddingHorizontal: isWeb ? 16 : 14,
                          paddingVertical: isWeb ? 10 : 8
                        }}>
                        <Text style={{
                          color: '#FFFFFF',
                          fontSize: isWeb ? 13 : 12,
                          fontWeight: '600'
                        }}>
                          Connect
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })}

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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
