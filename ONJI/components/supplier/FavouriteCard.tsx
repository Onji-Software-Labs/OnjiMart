import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions,StyleSheet, Animated, Easing } from 'react-native';
import { AntDesign, FontAwesome, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const CARD_MARGIN = 8;
const SCROLL_PADDING = 24;
const AVATAR_SIZE = 64;

export default function FavouriteCard({ data, onConnect, onOrder, connectionStatus,onToggleFavourite, style }: any) { // ✅ added onOrder
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  useEffect(() => {
    const onChange = (result: any) => {
      setScreenData(result.window);
    };

    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);

  const cardWidth = (screenData.width - SCROLL_PADDING - CARD_MARGIN) / 2;

  // Heart animation refs
  const heartScale = useRef(new Animated.Value(1)).current;
  const heartRotation = useRef(new Animated.Value(0)).current;

  const toggleFavorite = () => {
    onToggleFavourite(data.id);
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

     <View style={styles.avatarContainer}>
        {data.profilePicture ? (
          <Image
            source={{ uri: data.profilePicture }}
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

      <Text style={styles.name}>{data.name}</Text>
      <Text style={styles.description}> {data.description || 'No description'}</Text>
      <Text style={styles.location}>
        {data.distance} 
      </Text>  
      <View style={styles.ratingRow}>
        <View style={styles.ratingBadge}>
          <FontAwesome name="star" size={14} color="#2E7D32" />
          <Text style={styles.ratingText}> {data.rating ?? 4.5} ({data.reviews ?? 6})</Text>
        </View>
      </View>

      {/* <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <MaterialCommunityIcons name="cube-outline" size={18} color={data.activeOrder ? '#2563eb' : '#9CA3AF'} style={{ marginRight: 6 }} />
        <Text style={{ fontSize: 14, color: data.activeOrder ? '#2563eb' : '#9CA3AF', fontWeight: data.activeOrder ? '500' : '400' }}>{data.lastActive}</Text>
      </View> */}

      <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginTop: 8 }}>
        {data.showOrder && (
          <TouchableOpacity
            onPress={onOrder} // ✅ added onPress
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#10B981' }}>
            <Text style={{ textAlign: 'center', color: '#2E7D32', fontWeight: '500', fontSize: 16, marginRight: 8 }}>Order</Text>
            <AntDesign name="arrow-right" size={18} color="#2E7D32" />
          </TouchableOpacity>
        )}

        {data.showConnect && (
          <TouchableOpacity
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginVertical: 4,
            height:26,
            width:94,
            borderRadius: 6,
            borderWidth: 1,
            borderColor:
              connectionStatus === 'PENDING'
                ? '#D1D5DB'
                : '#2E7D32',
            backgroundColor: 'white',
            marginLeft: data.showOrder ? 8 : 0
          }}
            onPress={onConnect}
          >
            {connectionStatus === 'PENDING' ? (
              <>
                <Text style={{ textAlign: 'center', fontWeight: '500', fontSize: 16, color: '#6B7280', marginRight: 8 }}>Cancel</Text>
                <AntDesign name="close" size={16} color="#6B7280" />
              </>
            ) : connectionStatus === 'ACCEPTED' ? (
              <>
                <Text
                  style={{
                    textAlign: 'center',
                    fontWeight: '500',
                    fontSize: 12,
                    color: '#2E7D32',
                    marginRight: 8
                  }}
                >
                  Connected
                </Text>
                <AntDesign name="arrow-right" size={12} color="#2E7D32" />
              </>
            ) : (
              <>
                <FontAwesome5 name="user-plus" size={16} color="#10B981" style={{ marginRight: 8 }} />
                <Text style={{ textAlign: 'center', fontWeight: '500', fontSize: 16, color: '#10B981' }}>Connect</Text>
              </>
            )}
          </TouchableOpacity>
        )}
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