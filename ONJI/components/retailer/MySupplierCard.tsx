import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  TouchableOpacity,
  StyleSheet,
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

  return (
    <View style={styles.card}>
      {/* Favourite */}
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => onToggleFavourite(supplier.id)}
      >
        {isFavourite ? (
          <AntDesign name="heart" size={20} color="#EF4444" />
        ) : (
          <Ionicons name="heart-outline" size={20} color="#9CA3AF" />
        )}
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
          {supplier.city},{supplier.pincode}
        </Text>
  ): null}
 {/* {supplier.rating ? ( */}
        <View style={styles.ratingRow}>
          <FontAwesome name="star" size={14} color="#43A047" />
          <Text style={styles.ratingText}> {supplier.rating}</Text>
          {/* <Text style={styles.reviewCount}> (6)</Text> */}
          <View style={styles.creditBadge}>
            {/* <Text>🥔 🍏</Text> */}
          </View>
        </View>
        {/* ): null}  */}

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
                businessId: supplier.businessId,
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
  backgroundColor: '#fff',
  borderRadius: 8,
  borderWidth: 0.2,
  borderColor: '#92999E',
  padding: 12,
  // marginBottom: 15,
  marginEnd: 6,
  flexDirection: 'row',
  alignItems: 'flex-start',

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
  width: 72,
  height: 60,
  flexShrink: 0,
  // marginRight: 12,
  alignItems: 'center',
  justifyContent: 'center', // Vertical center

},

 avatar: {
    width: 60,
    height: 60,
  // alignSelf: 'center',

  borderRadius: 32,
  resizeMode: 'cover',
},

  infoContainer: {
    flex:1,
    marginRight:8,
    marginTop:4,
    marginEnd:4,
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
    fontSize: 10,
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
    fontSize: 13,
    color: '#43A047',
    fontWeight: '600',
  },

  reviewCount: {
    fontSize: 9,
    color: '#6B7280',
  },

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