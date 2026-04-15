import {
  AntDesign,
  FontAwesome,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export interface INewSupplier {
  id: string;
  name: string;
  description: string;
  location: string;
  rating: number;
  reviews: number;
  credit: boolean;
  imageUrl?: string;
}

interface Props {
  supplier: INewSupplier;
  isConnected: boolean;
  isFavourite: boolean;
  onConnect: (id: string) => void;
  onToggleFavourite: (id: string) => void;
}

const NewSupplierCard: React.FC<Props> = ({ supplier, isConnected, isFavourite, onConnect, onToggleFavourite }) => {
  // Heart animation refs
  const heartScale = useRef(new Animated.Value(1)).current;
  const heartRotation = useRef(new Animated.Value(0)).current;

  // Connect button animation refs
  const connectScale = useRef(new Animated.Value(1)).current;
  const connectBgColor = useRef(new Animated.Value(0)).current;

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

  const handleConnectPressIn = () => {
    Animated.parallel([
      Animated.timing(connectScale, { toValue: 0.92, duration: 100, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(connectBgColor, { toValue: 1, duration: 100, easing: Easing.linear, useNativeDriver: false }),
    ]).start();
  };

  const handleConnectPressOut = () => {
    Animated.parallel([
      Animated.timing(connectScale, { toValue: 1, duration: 100, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(connectBgColor, { toValue: 0, duration: 100, easing: Easing.linear, useNativeDriver: false }),
    ]).start();
    onConnect(supplier.id);
  };

  const handleCancelPress = () => {
    onConnect(supplier.id);
  };

  const rotateHeart = heartRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '12deg'],
  });

  const interpolatedConnectBg = connectBgColor.interpolate({
    inputRange: [0, 1],
    outputRange: ['white', '#D1FAE5'],
  });

  return (
    <View style={styles.card}>
      {/* Favourite Button */}
      <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton} activeOpacity={0.7}>
        <Animated.View style={{ transform: [{ scale: heartScale }, { rotate: rotateHeart }] }}>
          <AntDesign
            name={isFavourite ? 'heart' : 'hearto'}
            size={22}
            color={isFavourite ? '#EF4444' : '#9CA3AF'}
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {supplier.imageUrl ? (
          <Image
            source={{ uri: supplier.imageUrl }}
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

      {/* Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{supplier.name}</Text>
        <Text style={styles.description}>{supplier.description}</Text>
        <Text style={styles.location}>{supplier.location}</Text>

        {/* Rating Row */}
        <View style={styles.ratingRow}>
          <FontAwesome name="star" size={14} color="#22C55E" />
          <Text style={styles.ratingText}> {supplier.rating}</Text>
          <Text style={styles.reviewCount}> ({supplier.reviews})</Text>
          {supplier.credit && (
            <View style={styles.creditBadge}>
              <MaterialCommunityIcons name="credit-card-outline" size={12} color="#047857" />
              <Text style={styles.creditText}>Credit</Text>
            </View>
          )}
        </View>
      </View>

      {/* Action Button */}
      {isConnected ? (
        <TouchableOpacity onPress={handleCancelPress} style={styles.cancelButton} activeOpacity={0.7}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
          <AntDesign name="close" size={14} color="#6B7280" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPressIn={handleConnectPressIn}
          onPressOut={handleConnectPressOut}
          style={styles.connectButtonWrapper}
          activeOpacity={1}
        >
          <Animated.View
            style={[
              styles.connectButton,
              { transform: [{ scale: connectScale }], backgroundColor: interpolatedConnectBg },
            ]}
          >
            <Text style={styles.connectButtonText}>Connect</Text>
            <MaterialCommunityIcons name="account-plus" size={18} color="#34D399" />
          </Animated.View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 6,
    zIndex: 10,
  },
  avatarContainer: {
    flexShrink: 0,
    marginRight: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    resizeMode: 'cover',
  },
  infoContainer: {
    flex: 1,
    paddingRight: 30,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 1,
  },
  description: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 1,
  },
  location: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    color: '#047857',
    fontWeight: '600',
  },
  reviewCount: {
    fontSize: 13,
    color: '#6B7280',
  },
  creditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  creditText: {
    fontSize: 10,
    color: '#047857',
    fontWeight: '600',
    marginLeft: 3,
  },
  connectButtonWrapper: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#34D399',
    columnGap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  connectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34D399',
  },
  cancelButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: 'white',
    columnGap: 6,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
});

export default NewSupplierCard;
