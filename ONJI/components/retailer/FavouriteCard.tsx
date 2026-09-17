import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions ,StyleSheet, Animated, Easing} from 'react-native';
import { AntDesign, FontAwesome, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ConnectionStatus } from '../../lib/api/connection';
import { useRouter } from 'expo-router';
import { INewSupplier } from './NewSupplierCard';
import { LinearGradient } from 'expo-linear-gradient';

const CARD_MARGIN = 8;
const SCROLL_PADDING = 24;
const AVATAR_SIZE = 64;

export default function FavouriteCard({
  supplier,
  connectionStatus,
  onConnect,
  onToggleFavourite,
  style
}: {
  supplier: INewSupplier;
  connectionStatus: ConnectionStatus;
  onConnect: (id: string) => void;
  onToggleFavourite: (id: string) => void;
  style?: any;
}) {
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const router = useRouter();

  // Heart animation refs
  const heartScale = useRef(new Animated.Value(1)).current;
  const heartRotation = useRef(new Animated.Value(0)).current;

  const toggleFavorite = () => {
    onToggleFavourite(supplier.id);
    heartScale.setValue(1);
    heartRotation.setValue(0);
    Animated.parallel([
      Animated.spring(heartScale, { toValue: 1.3, friction: 3, useNativeDriver: true }),
      Animated.timing(heartRotation, { toValue: 1, duration: 200, easing: Easing.linear, useNativeDriver: true }),
    ]).start(() => {
      Animated.spring(heartScale, { toValue: 1, friction: 7, useNativeDriver: true }).start();
      heartRotation.setValue(0);
    });
  };

  const rotateHeart = heartRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '12deg'],
  });

  useEffect(() => {
    const onChange = (result: any) => {
      setScreenData(result.window);
    };

    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);

  const cardWidth = (screenData.width - SCROLL_PADDING - CARD_MARGIN) / 2;

  // 🔥 Button Logic
  const getButtonText = () => {
    if (connectionStatus === 'PENDING') return 'Cancel';
    if (connectionStatus === 'ACCEPTED') return 'Order';
    return 'Connect';
  };

  const handlePress = () => {
    if (connectionStatus === 'ACCEPTED') {
      router.push({
        pathname: '/(retailer)/orderSupplierScreen',
        params: {
          supplierId: supplier.id,
          businessId: supplier.businessId,
          supplierName: supplier.businessName,
        },
      });
    } else if (connectionStatus === 'NONE' || connectionStatus === 'REJECTED'|| connectionStatus==='CANCELLED') {
      router.push({
        pathname: '/(retailer)/connectScreen',
        params: {
          supplierId: supplier.id,
          businessId: supplier.businessId,
        },
      });
    } else if (connectionStatus === 'PENDING') {
      onConnect(supplier.id);
    }
  };

  return (
    <View
      style={[{
        width: cardWidth,
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 0.2,
        borderColor: '#92999E',
        padding: 12,
        marginBottom: 5,
        marginTop: 5,
      }, style]}
    >
      {/* Favourite — always filled/red here, since every card in this screen IS a favourite */}
      <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton} activeOpacity={0.7}>
        <Animated.View style={{ transform: [{ scale: heartScale }, { rotate: rotateHeart }] }}>
          <Ionicons
            name="heart"
            size={20}
            color="#EF4444"
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {supplier.profilePicture ? (
          <Image
            source={{ uri: supplier.profilePicture }}
            style={styles.avatar}
            onError={() => {}}
          />
        ) : (
          <Image
            source={require('../../assets/images/fav_avatar.png')}
            style={styles.avatar}
          />
        )}
      </View>

      {/* Supplier Info */}
      <Text style={styles.name}>{supplier.businessName}</Text>

      <Text style={styles.description}>
        {supplier.contactNumber || 'No contact info'}
      </Text>

      <Text style={styles.location}>
        {supplier.address} {supplier.city} {supplier.pincode || 'Location unavailable'}
      </Text>

      {/* Rating */}
      <View style={styles.ratingRow}>
        <View style={styles.ratingBadge}>
          <FontAwesome name="star" size={14} color="#43A047" />
          <Text style={styles.ratingText}> {supplier.rating ?? 4.5} ({supplier.reviews ?? 6})</Text>
        </View>
      </View>

      {/* Activity — only show when connected (Order button state) */}
      {connectionStatus === 'ACCEPTED' && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, alignSelf: 'center' }}>
          <MaterialCommunityIcons name="cube-outline" size={15} color="#2F4DFF" />
          <Text style={{ fontSize: 11, color: '#2F4DFF', marginLeft: 6 }}>
            Active order
          </Text>
        </View>
      )}

      {/* 🔥 Button */}
      <View style={{ marginTop: 8 }}>
        <TouchableOpacity
          onPress={handlePress}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 8,
            borderRadius: 8,
            borderWidth: 1,
            borderColor:
              connectionStatus === 'PENDING' ? '#D1D5DB' : '#2E7D32',
            backgroundColor: 'white',
            columnGap: 4,
          }}
        >
          <Text
            style={{
              color:
                connectionStatus === 'PENDING' ? '#6B7280' : '#2E7D32',
              fontWeight: '500',
              fontSize: 12,
            }}
          >
            {getButtonText()}
          </Text>

          {connectionStatus === 'PENDING' ? (
            <AntDesign name="close" size={14} color="#72797D" />
          ) : connectionStatus === 'RECEIVED_PENDING' ? (
            <AntDesign name="check" size={14} color="#2E7D32" />
          ) : connectionStatus === 'ACCEPTED' ? (
            <AntDesign name="arrow-right" size={14} color="#2E7D32" />
          ) : (
            <MaterialCommunityIcons name="account-plus" size={18} color="#2E7D32" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  favoriteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    padding: 2,
    zIndex: 100,
  },
  avatarContainer: {
    position: 'absolute',
    top: -(AVATAR_SIZE / 2),
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    resizeMode: 'cover',
    borderWidth: 3,
    borderColor: 'white',
  },
  name: {
    marginTop: 20,
    fontSize: 13,
    fontWeight: '800',
    color: '#242525',
    marginBottom: 1,
  },
  description: {
    fontSize: 12,
    fontWeight: '400',
    color: '#242525',
    marginBottom: 3,
  },
  location: {
    fontSize: 10,
    color: '#72797D',
    marginTop: 1,
    marginBottom: 4,
    flexShrink: 1,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0D260F',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  reviewCount: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0D260F',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E6F4EA',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});