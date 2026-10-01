import React from 'react';
import { View, Text,Image,TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5,FontAwesome, AntDesign, Ionicons, Feather } from '@expo/vector-icons';
import { INewSupplier } from '@/app/(supplier)/(tabs)/Vendor';
const MyVendorCard = ({
  supplier,
  isFavourite,
  onToggleFavourite,
}: {
  supplier: INewSupplier;
  isFavourite: boolean;
  onToggleFavourite: (id: string) => void;
}) => {
  return (
    <View style={styles.card}>
      {/* Favourite */}
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => onToggleFavourite(supplier.id)}
      >
        {isFavourite ? (
          <AntDesign name="heart" size={18} color="#EF4444" />
        ) : (
          <Ionicons name="heart-outline" size={18} color="#9CA3AF" />
        )}
      </TouchableOpacity>

      {/* Avatar */}
   <View style={styles.avatarContainer}>
        {supplier.imageUrl ? (
          <Image source={{ uri: supplier.imageUrl }} style={styles.avatar} onError={() => {}} />
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
        <Text style={styles.description}>{supplier.description || 'Random kaka'}</Text>
        <Text style={styles.location}>{supplier.location || '3 kms away, Udupi'}</Text>

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
          <Feather name="clock" size={12} color="#9CA3AF" />
          <Text style={styles.daysAgo}>3 days ago</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.phoneButton}>
          <Feather name="phone" size={16} color="#6B7280" />
        </TouchableOpacity>

        <View style={styles.connectButtonWrapper}>
          <TouchableOpacity style={styles.connectButton}>
            <Text style={styles.connectButtonText}>Connected</Text>
            <Ionicons name="arrow-forward" size={14} color="#10B981" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default MyVendorCard;

const styles = StyleSheet.create({
  card: {
      height: 'auto',
  width: '100%',
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 0.2,
    borderColor: '#92999e6b',
    padding: 10,
    marginBottom: 8,
    flexDirection: 'row',
    minHeight: 120,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.06,
    // shadowRadius: 6,
    elevation: 3,
    alignItems: 'center',
    // justifyContent: 'center',
  },

  favoriteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    padding: 2,
    zIndex: 100,
  },
 avatar: {
    width: 60,
    height: 60,
    borderRadius: 32,
    resizeMode: 'cover',
  },

  avatarContainer: {
    // flexShrink: 0,
    // marginRight: 10,
    width: 72,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center', // Vertical center
  },

  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 32,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoContainer: {
    flex:1,
    // marginRight:8,
    // marginTop:4,
    // marginEnd:4,
  },

  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3F4245',
    flexShrink: 1,
    marginBottom: 1,

  },

  description: {
    fontSize: 12,
    color: '#3F4245',
    marginBottom: 1,

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
  marginTop: 4,
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
creditBadge: {
  marginLeft: 8,
},
  emoji: {
    fontSize: 12,
  },

  bottomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  daysAgo: {
    fontSize: 10,
    color: '#9CA3AF',
    marginLeft: 4,
  },

  actionContainer: {
    position: 'absolute',
    right: 16,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  phoneButton: {
    marginRight: 10,
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
    columnGap: 4,
    backgroundColor: '#E2F6E3',
  },

  connectButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
});