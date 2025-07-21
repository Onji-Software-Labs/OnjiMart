import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';

export interface ISupplier {
  id: string;
  name: string;
  description: string;
  location: string;
  rating: number;
  reviews: number;
  imageUrl: string;
}

interface ISupplierTabProps {
  supplier: ISupplier;
}

const SupplierTab: React.FC<ISupplierTabProps> = ({ supplier }) => {
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  const heartScale = useRef(new Animated.Value(1)).current;
  const heartRotation = useRef(new Animated.Value(0)).current;

  const connectScale = useRef(new Animated.Value(1)).current;
  const connectBgColor = useRef(new Animated.Value(0)).current;

  const toggleFavorite = () => {
    setIsFavorite(prev => !prev);

    heartScale.setValue(1);
    heartRotation.setValue(0);
    Animated.parallel([
      Animated.spring(heartScale, {
        toValue: 1.3,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(heartRotation, {
        toValue: 1,
        duration: 200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.spring(heartScale, {
        toValue: 1,
        friction: 7,
        useNativeDriver: true,
      }).start();
      heartRotation.setValue(0);
    });
  };

  const handleConnectPressIn = () => {
    Animated.parallel([
      Animated.timing(connectScale, {
        toValue: 0.9,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(connectBgColor, {
        toValue: 1,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleConnectPressOut = () => {
    Animated.parallel([
      Animated.timing(connectScale, {
        toValue: 1,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(connectBgColor, {
        toValue: 0,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const rotateHeart = heartRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '12deg'],
  });

  const interpolatedConnectBgColor = connectBgColor.interpolate({
    inputRange: [0, 1],
    outputRange: ['white', '#D1FAE5'],
  });

  return (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={toggleFavorite}
        style={styles.favoriteButton}
        activeOpacity={0.7}
      >
        <Animated.View style={{ transform: [{ scale: heartScale }, { rotate: rotateHeart }] }}>
          <AntDesign
            name={isFavorite ? "heart" : "hearto"}
            size={24}
            color={isFavorite ? "#B91C1C" : "#9CA3AF"}
          />
        </Animated.View>
      </TouchableOpacity>

      <>
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: supplier.imageUrl }}
            style={styles.profileImage}
            onError={(error) => console.log('Image loading error:', error.nativeEvent.error)}
          />
        </View>

        <View style={styles.supplierInfo}>
          <Text style={styles.companyName}>{supplier.name}</Text>
          <Text style={styles.supplierDescription}>{supplier.description}</Text>
          <Text style={styles.supplierLocation}>{supplier.location}</Text>

          <LinearGradient
            colors={['rgba(248, 248, 248, 1)', 'rgba(248, 248, 248, 0)']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            locations={[0.85, 1]}
            style={styles.reviewSectionBackground}
          >
            <View style={styles.reviewContent}>
              <FontAwesome name="star" size={16} color="#0F9D58" style={styles.starIcon} />
              <Text style={styles.reviewText}>{supplier.rating}</Text>
              <Text style={styles.reviewText}> ({supplier.reviews})</Text>
            </View>
          </LinearGradient>
        </View>
      </>

      <TouchableOpacity
        onPress={() => console.log(`Connect button clicked for ${supplier.name}!`)}
        onPressIn={handleConnectPressIn}
        onPressOut={handleConnectPressOut}
        style={styles.connectButtonWrapper}
        activeOpacity={1}
      >
        <Animated.View
          style={[
            styles.connectButton,
            { transform: [{ scale: connectScale }], backgroundColor: interpolatedConnectBgColor },
          ]}
        >
          <Text style={styles.connectButtonText}>Connect</Text>
          <MaterialCommunityIcons name="account-plus" size={20} color="#0F9D58" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    position: 'relative',
    paddingBottom: 64,
    paddingRight: 16,
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    borderRadius: 9999,
    zIndex: 10,
  },
  profileImageContainer: {
    flexShrink: 0,
    paddingTop: 32,
  },
  profileImage: {
    height: 96,
    width: 96,
    borderRadius: 9999,
    resizeMode: 'cover',
  },
  supplierInfo: {
    flexGrow: 1,
    marginLeft: 16,
  },
  companyName: { 
    fontSize: 20,
    fontWeight: '600',
    color: '#545557ff',
  },
  supplierDescription: {
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '400',
  },
  supplierLocation: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
  reviewSectionBackground: {
    marginTop: 4,
    borderRadius: 9999,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  reviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: 4,
  },
  reviewText: {
    fontSize: 14,
    color: '#0F9D58',
    fontWeight: '400',
  },
  connectButtonWrapper: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    zIndex: 10,
  },
  connectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#0F9D58',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 8,
    elevation: 0,
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F9D58',
    marginRight: 4,
  },
});

export default SupplierTab;
