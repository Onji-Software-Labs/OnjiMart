import React from 'react';
import { Tabs } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Feather, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
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
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Supplier',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person-pin" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color }) => (
            <Feather name="shopping-cart" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="invoice"
        options={{
          title: 'Invoice',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="file-invoice" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

function SupplierTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View className="flex-row bg-white border-t border-gray-200">
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
            className={`flex-1 items-center justify-center py-3 ${
              isFocused ? 'bg-[#2E7D32]' : 'bg-white'
            }`}
          >
            {/* Icon Container */}
            <View className="mb-1">
              {options.tabBarIcon?.({ 
                color: isFocused ? '#FFFFFF' : '#6B7280',
                focused: isFocused, 
                size: 24 
              })}
            </View>
            
            {/* Label */}
            <Text 
              className={`text-xs font-medium ${
                isFocused ? 'text-white' : 'text-gray-600'
              }`}
            >
              {options.title}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}