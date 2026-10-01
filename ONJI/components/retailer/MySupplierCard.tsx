import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import {
  AntDesign,
  Ionicons,
  Feather,
  FontAwesome,
} from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { INewSupplier } from '@/components/retailer/NewSupplierCard';

const MySupplierCard = ({
  supplier,
  isFavourite,
  onToggleFavourite,
}: {
  supplier: INewSupplier;
  isFavourite: boolean;
  onToggleFavourite: (id: string) => void;
}) => {
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


  return (
    <View style={styles.card}>
      {/* Favourite */}
<TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton} activeOpacity={0.7}>
  <Animated.View style={{ transform: [{ scale: heartScale }, { rotate: rotateHeart }] }}>
    <Ionicons
      name={isFavourite ? 'heart' : 'heart-outline'}
      size={20}
      color={isFavourite ? '#EF4444' : '#9CA3AF'}
    />
  </Animated.View>
</TouchableOpacity>
      
      
      {/* Profile */}
      <View style={styles.avatarContainer}>
        {supplier.profilePicture ? (
          <Image
            source={{ uri: supplier.profilePicture }}
            style={styles.avatar}
          />
        ) : (
          <Image
            source={require('../../assets/images/fav_avatar.png')}
            style={styles.avatar}
          />
        )}
      </View>

      {/* Supplier Details */}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{supplier.businessName}</Text>

        <Text style={styles.description}>
          {supplier.fullName }
        </Text>      

  {supplier.city && supplier.pincode ? (

        <Text style={styles.location}>
          {supplier.address},{supplier.city}
        </Text>
  ): null}
   <View style={styles.ratingRow}>
  <View style={styles.ratingBadge}>
    <FontAwesome name="star" size={14} color="#43A047" />
    <Text style={styles.ratingText}> {supplier.rating ?? 4.5} ({supplier.reviews ?? 6})</Text>
  </View>

  <View style={styles.creditBadge}>
    <Text>🥔 🍏</Text>
  </View>
</View>

        <View style={styles.bottomInfo}>
          <Feather name="box" size={10} color="#92999E" />
          <Text style={styles.daysAgo}>3 days ago</Text>
        </View>
      </View>
    

    <View style={styles.actionContainer}>
      <TouchableOpacity style={styles.phoneButton}>
        <Feather name="phone" size={12} color="#6B7280" />
      </TouchableOpacity>

      <View style={styles.connectButtonWrapper}>
        <Pressable
          style={styles.connectButton}
          onPress={() =>
            router.push({
              pathname: '/(retailer)/orderSupplierScreen',
              params: {
                supplierId: supplier.id,
                // Connected-supplier responses identify the supplier by UUID.
                // Keep the route usable if an older response omitted businessId.
                businessId: supplier.businessId || supplier.id,
                supplierName: supplier.businessName,
              },
            })
          }
        >
          <Text style={styles.connectButtonText}>Order</Text>
          <AntDesign
            name="arrow-right"
            size={14}
            color="#2E7D32"
          />
        </Pressable>
      </View>
    </View>
    </View>
  );
};

export default MySupplierCard;

const styles = StyleSheet.create({
  card: {
  height: 'auto',
  width: '100%',
  backgroundColor: '#fff',
  borderRadius: 6,
  borderWidth: 0.2,
  borderColor: '#92999e6b',
  padding: 12,
  marginBottom: 15,
  marginEnd: 6,
  flexDirection: 'row',
  alignItems: 'center',
    // backgroundColor:'#e72b2b',

  minHeight: 120,   // <-- add this

  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 6,
  elevation: 3,
},

  favoriteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    padding: 2,
    zIndex: 100,
    
  },

  avatarContainer: {
    flexShrink: 0,
    marginRight: 10,
    width: 72,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center', // Vertical center
  },

 avatar: {
    width: 60,
    height: 60,
    borderRadius: 32,
    resizeMode: 'cover',
    alignSelf: 'center',

},

  infoContainer: {
    flex:1,
    // marginRight:8,
    // marginTop:0,
    // marginEnd:4,
    // paddingRight:110,
},

  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3F4245',
    marginBottom: 1,
    // paddingRight: 19, // <-- add this to prevent text overflow
  },

  description: {
    fontSize: 12,
    color: '#3F4245',
    marginTop: 1,
    flexShrink: 1,
  },

  location: {
    fontSize: 11,
    color: '#72797D',
    marginTop: 1,
    marginBottom: 4,
    flexShrink: 1,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  creditBadge: {
    marginLeft: 8,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#43A047',
  },
  reviewCount: {
    fontSize: 10,
    fontWeight: '600',
    color: '#43A047',
  },
  ratingBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  alignSelf: 'flex-start',   // ✅ pill only wraps its own content, doesn't stretch
  backgroundColor: '#E6F4EA',
  borderRadius: 6,
  paddingHorizontal: 8,
  paddingVertical: 3,
},

  // reviewCount: {
  //   fontSize: 9,
  //   color: '#6B7280',
  // },

  bottomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 9,
  },

  daysAgo: {
    fontSize: 10,
    color: '#92999E',
    marginLeft: 6,
  },

  actionContainer: {
  position: 'absolute',
  right: 16,
  bottom: 16,
// backgroundColor: '#fff',
  flexDirection: 'row',
  alignItems: 'center',
},

  phoneButton: {
    marginRight:8,
    marginEnd: 7,
    marginTop: 7,
    marginLeft:8,
  },

connectButtonWrapper: {
  borderRadius: 6,
  borderWidth: 0.2,
  borderColor: '#2E7D32',
  overflow: 'hidden',
},

connectButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 10,
  paddingVertical: 6,
  columnGap: 3,
  backgroundColor: '#E2F6E3'
},

connectButtonText: {
  fontSize: 12,
  fontWeight: '600',
  color: '#2E7D32',
}


});
