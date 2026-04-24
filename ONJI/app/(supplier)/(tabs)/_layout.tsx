import React from 'react';
import { Tabs } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Feather, MaterialIcons, FontAwesome5, Octicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

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
        name="Vendor"
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
          title: 'Cart',
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

function SupplierTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: 'white',
      borderTopWidth: 1,
      borderTopColor: '#F3F4F6',
      // This padding ensures it looks right on both iOS and Android
      paddingBottom: 25, 
      paddingTop: 10,
      // These ensure no black shadows or borders appear
      elevation: 0,
      shadowOpacity: 0,
    }}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const { options } = descriptors[route.key];

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            // Remove all className here to ensure no hidden borders
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            {/* The Pill Background */}
            <View 
              style={{ 
                backgroundColor: isFocused ? '#E8F5E9' : 'transparent',
                paddingHorizontal: 20,
                paddingVertical: 4,
                borderRadius: 20,
                marginBottom: 4,
                // Ensure no border is inherited
                borderWidth: 0,
              }}
            >
              {options.tabBarIcon?.({
                color: isFocused ? '#2E7D32' : '#9CA3AF',
                focused: isFocused,
                size: 24
              })}
            </View>

            <Text 
              style={{ 
                fontSize: 10, 
                fontWeight: isFocused ? '600' : '400',
                color: isFocused ? '#111827' : '#9CA3AF' 
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