import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons'; 
import { secureStorage } from '@/lib/secureStorage';
import axiosInstance from "@/lib/api/axiosConfig";

export default function NotificationsScreen() {
  const isWeb = Platform.OS === 'web'; 
  
  // State to track which requests have been confirmed
  const [confirmedRequests, setConfirmedRequests] = useState<number[]>([]);
  const [requestsList, setRequestsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const supplierId = await secureStorage.getItem("userId");
        if (!supplierId) return;

        const response = await axiosInstance.get(
          `/api/connections/supplier/${supplierId}/requests`
        );
        
        const requestsWithNames = await Promise.all(
          response.data.map(async (req: any) => {
            try {
              let name = 'Retailer';
              
              // We need the business name. Since our endpoint requires a businessId and we only have the retailerId,
              // we can fetch all businesses and easily find the one belonging to this retailerId.
              try {
                const allBusinessRes = await axiosInstance.get(`/api/retailer-business/all`);
                const allBusinesses = allBusinessRes.data || [];
                
                // Find the business object that belongs to this retailer
                const userBusiness = allBusinesses.find(
                  (biz: any) => biz.retailerId === req.retailerId
                );

                if (userBusiness && userBusiness.name && userBusiness.name !== 'string') {
                  name = userBusiness.name;
                }
              } catch (bizErr) {
                console.warn(`Could not fetch businesses to match retailer ${req.retailerId}`);
              }

              // Fallback to User object if Business doesn't exist
              if (name === 'Retailer') {
                const userRes = await axiosInstance.get(`/api/users/${req.retailerId}`);
                const fullName = userRes.data.fullName;
                const username = userRes.data.username;
                const phoneNumber = userRes.data.phoneNumber;
                
                if (fullName && fullName !== 'string' && fullName.trim() !== '') {
                  name = fullName;
                } else if (phoneNumber && phoneNumber !== 'string' && phoneNumber.trim() !== '') {
                  name = phoneNumber; // Fallback to phone number
                } else if (username && username !== 'string' && username.trim() !== '' && !username.includes('-')) {
                  name = username;
                }
              }

              return { 
                ...req, 
                retailerName: name
              };
            } catch (err) {
              console.error(`Error fetching user ${req.retailerId}:`, err);
              return { ...req, retailerName: 'Retailer' };
            }
          })
        );
        
        setRequestsList(requestsWithNames);
      } catch (error) {
        console.error("Error fetching requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleDelete = async (request: any) => {
    try {
      const supplierId = await secureStorage.getItem("userId");
      
      await axiosInstance.post("/api/connections/reject", null, {
        params: {
          retailerId: request.retailerId,
          supplierId: supplierId,
        },
      });

      setRequestsList((prev) => prev.filter(r => r.id !== request.id));
    } catch (error) {
      console.error("Error rejecting connection: ", error);
    }
  };

  const handleConfirm = async (request: any) => {
    try {
      const supplierId = await secureStorage.getItem("userId");

      await axiosInstance.post("/api/connections/accept", null, {
        params: {
          retailerId: request.retailerId,
          supplierId: supplierId,
        },
      });

      setConfirmedRequests((prev) => [...prev, request.id]);
    } catch (error) {
      console.error("Error accepting connection: ", error);
    }
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
          {loading ? (
            <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 20 }} />
          ) : requestsList.length === 0 ? (
            <Text style={{ textAlign: 'center', color: '#6B7280', marginTop: 20 }}>No pending requests</Text>
          ) : (
            requestsList.map((request: any) => {
              const isConfirmed = confirmedRequests.includes(request.id);
              
              const retailerName = request.retailerName || `Retailer`;
              let formattedTime = "";
              if (request.createdAt) {
                const date = new Date(request.createdAt);
                formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              }

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
                            <Text style={{ fontWeight: '400' }}>{retailerName}</Text> is now your connection
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
                      <Text style={{ textAlign: 'right', fontSize: 11, color: '#9CA3AF', marginTop: 8 }}>{formattedTime}</Text>
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
                            <Text style={{ fontWeight: '700', color: '#1F2937' }}>{retailerName}</Text> wants to connect with you
                          </Text> 
                        </View>
                      </View>

                      <View style={{ flexDirection: 'row', marginTop: 12, marginLeft: 60, gap: 10 }}>
                        <TouchableOpacity 
                          onPress={() => handleConfirm(request)} // Triggers state change
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
                          onPress={() => handleDelete(request)} 
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
                      <Text style={{ textAlign: 'right', fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{formattedTime}</Text> 
                    </View>
                  )}
                </View>
              );
            })
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}