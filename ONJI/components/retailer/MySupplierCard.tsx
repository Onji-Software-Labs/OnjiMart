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
          <AntDesign name="heart" size={22} color="#EF4444" />
        ) : (
          <Ionicons name="heart-outline" size={22} color="#9CA3AF" />
        )}
      </TouchableOpacity>

      
      
      {/* Profile */}
      <View style={styles.avatarContainer}>
        {supplier.imageUrl ? (
          <Image
            source={{ uri: supplier.imageUrl }}
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
        <Text style={styles.name}>{supplier.name}</Text>

        <Text style={styles.description}>
          {supplier.description || 'Random kaka'}
        </Text>

        <Text style={styles.location}>
          {supplier.location || '3 kms away'}
        </Text>

        <View style={styles.ratingRow}>
          <AntDesign name="star" size={13} color="#10B981" />
          <Text style={styles.ratingText}> 4.5</Text>
          <Text style={styles.reviewCount}> (6)</Text>
          <View style={styles.creditBadge}>
            <Text>🥔 🍏</Text>
          </View>
        </View>

        <View style={styles.bottomInfo}>
          <Feather name="box" size={12} color="#9CA3AF" />
          <Text style={styles.daysAgo}>3 days ago</Text>
        </View>
      </View>
    

    <View style={styles.actionContainer}>
      <TouchableOpacity style={styles.phoneButton}>
        <Feather name="phone" size={20} color="#6B7280" />
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
                supplierName: supplier.name,
              },
            })
          }
        >
          <Text style={styles.connectButtonText}>Order</Text>
          <AntDesign
            name="arrow-right"
            size={16}
            color="#34D399"
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
  borderRadius: 14,
  borderWidth: 1,
  borderColor: '#E5E7EB',
  padding: 14,
  marginBottom: 12,

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
    top: 12,
    right: 12,
    padding: 6,
    zIndex: 100,
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
    flex:1,
    marginLeft:12,
    paddingRight:110,
},

  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    flexShrink: 1,
  },

  description: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 1,
    flexShrink: 1,
  },

  location: {
    fontSize: 11,
    color: '#9CA3AF',
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
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
  },

  reviewCount: {
    fontSize: 12,
    color: '#6B7280',
  },

  bottomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  daysAgo: {
    fontSize: 10,
    color: '#9CA3AF',
    marginLeft: 4,
  },

  actionContainer: {
  position: 'absolute',
  right: 16,
  bottom: 16,

  flexDirection: 'row',
  alignItems: 'center',
},

  phoneButton: {
    marginRight: 10,
  },

connectButtonWrapper: {
  borderRadius: 10,
  borderWidth: 1.5,
  borderColor: '#34D399',
  overflow: 'hidden',
},

connectButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 14,
  paddingVertical: 8,
  columnGap: 6,
},

connectButtonText: {
  fontSize: 14,
  fontWeight: '600',
  color: '#34D399',
},


});