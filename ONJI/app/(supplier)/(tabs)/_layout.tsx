import React from 'react';
import { Tabs, useRouter, Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Feather, MaterialIcons, Octicons } from '@expo/vector-icons';

export default function SupplierTabs() {
  return (
    <Tabs
      initialRouteName="dashboard"
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
      tabBar={(props) => <SupplierTabBar {...props} />}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Octicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="vendor" // ✅ FIXED (lowercase)
        options={{
          title: 'Vendor',
          tabBarIcon: ({ color }) => <MaterialIcons name="assignment" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="store"
        options={{
          title: 'Store',
          tabBarIcon: ({ color }) => <MaterialIcons name="storefront" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => <Feather name="shopping-cart" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="invoice"
        options={{
          title: 'Invoice',
          tabBarIcon: ({ color }) => <MaterialIcons name="receipt-long" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

function SupplierTabBar({ state, descriptors }: any) {
  const router = useRouter();

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingBottom: 25,
        paddingTop: 10,
        elevation: 0,
        shadowOpacity: 0,
      }}
    >
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const { options } = descriptors[route.key];

        const onPress = () => {
          if (!isFocused) {
            router.push(`/${route.name}` as Href);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            <View
              style={{
                backgroundColor: isFocused ? '#E8F5E9' : 'transparent',
                paddingHorizontal: 20,
                paddingVertical: 4,
                borderRadius: 20,
                marginBottom: 4,
              }}
            >
              {options.tabBarIcon?.({
                color: isFocused ? '#2E7D32' : '#9CA3AF',
                focused: isFocused,
                size: 24,
              })}
            </View>

            <Text
              style={{
                fontSize: 10,
                fontWeight: isFocused ? '600' : '400',
                color: isFocused ? '#111827' : '#9CA3AF',
              }}
            >
              {options.title}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}