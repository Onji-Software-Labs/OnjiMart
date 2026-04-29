import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  StatusBar,
  Platform 
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons'; 

// Mock data to map through
const requests = [
  { id: 1, name: 'Random kaka', time: '1:28 pm' },
  { id: 2, name: 'Random kaka', time: '1:28 pm' },
  { id: 3, name: 'Random kaka', time: '1:28 pm' },
];

export default function NotificationsScreen() {
  const isWeb = Platform.OS === 'web'; 
  
  // State to track which requests have been confirmed
  const [confirmedRequests, setConfirmedRequests] = useState<number[]>([]);
  const [requestsList, setRequestsList] = useState(requests);
  const handleDelete = (id: number) => {
    setRequestsList((prev) => prev.filter(request => request.id !== id));
  };

  // Handler to add the request ID to the confirmed array
  const handleConfirm = (id: number) => {
    setConfirmedRequests((prev) => [...prev, id]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}> 
      <StatusBar barStyle="dark-content" />

      {/* Header with Back Button */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 16, 
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6'
      }}>
        <TouchableOpacity onPress={() => router.back()}> 
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={{ 
          fontSize: 20, 
          fontWeight: '700', 
          color: '#2E7D32', 
          marginLeft: 12 
        }}>
          Notifications
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}> 
        <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
          
          {/* Section Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937' }}>Requests</Text> 
            <TouchableOpacity>
              <Text style={{ color: '#2E7D32', fontWeight: '600' }}>View all {'>'}</Text>
            </TouchableOpacity>
          </View>

          {/* Request Item Component */}
          {requestsList.map((request) => {
            const isConfirmed = confirmedRequests.includes(request.id);

            return (
              <View key={request.id} style={{ marginBottom: 20 }}>
                {isConfirmed ? (
                  
                  /* CONFIRMED STATE UI                         */
        
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      {/* Left Side: Avatar + Text */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 }}>
                        <Image
                          source={require('../../assets/images/3davatar.png')} 
                          style={{ 
                            width: 48, 
                            height: 48, 
                            borderRadius: 24,
                            resizeMode: 'cover' 
                          }} 
                        />
                        <Text style={{ marginLeft: 12, fontSize: 14, color: '#1F2937', flexShrink: 1 }}>
                          <Text style={{ fontWeight: '400' }}>{request.name}</Text> is now your connection
                        </Text>
                      </View>

                      {/* Right Side: Phone Icon & Order Button */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <TouchableOpacity>
                          <Feather name="phone" size={20} color="#374151" />
                        </TouchableOpacity>

                        <TouchableOpacity style={{
                          backgroundColor: '#EAF5EA', 
                          borderColor: '#A7D7A9',     
                          borderWidth: 1,
                          paddingVertical: 6,
                          paddingHorizontal: 12,
                          borderRadius: 8,
                          flexDirection: 'row',
                          alignItems: 'center'
                        }}>
                          <Text style={{ color: '#2E7D32', fontWeight: '600', fontSize: 14, marginRight: 4 }}>
                            Order
                          </Text>
                          <Feather name="arrow-right" size={16} color="#2E7D32" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={{ textAlign: 'right', fontSize: 11, color: '#9CA3AF', marginTop: 8 }}>{request.time}</Text>
                  </View>

                ) : (

                 
                  /* PENDING STATE UI                           */
                  
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Image
                        source={require('../../assets/images/3davatar.png')} 
                        style={{ 
                          width: 48, 
                          height: 48, 
                          borderRadius: 24,
                          resizeMode: 'cover' 
                        }} 
                      />
                      <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={{ fontSize: 14, color: '#4B5563' }}>
                          <Text style={{ fontWeight: '700', color: '#1F2937' }}>{request.name}</Text> wants to connect with you
                        </Text> 
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', marginTop: 12, marginLeft: 60, gap: 10 }}>
                      <TouchableOpacity 
                        onPress={() => handleConfirm(request.id)} // Triggers state change
                        style={{
                          backgroundColor: '#2E7D32', 
                          paddingVertical: 10,
                          borderRadius: 8,
                          flex: 1,
                          alignItems: 'center'
                        }}>
                        <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 13 }}>Confirm</Text> 
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        onPress={() => handleDelete(request.id)} 
                        style={{
                          borderWidth: 1,
                          borderColor: '#D1D5DB', 
                          paddingVertical: 10,
                          borderRadius: 8,
                          flex: 1,
                          alignItems: 'center'
                        }}>
                        <Text style={{ color: '#6B7280', fontWeight: '600', fontSize: 13 }}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={{ textAlign: 'right', fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{request.time}</Text> 
                  </View>
                )}
              </View>
            );
          })}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}