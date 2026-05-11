import React from 'react';
import { Tabs, useRouter, Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Feather, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

export default function RetailerTabs() {
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{ 
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
      tabBar={(props) => <RetailerTabBar {...props} />}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="supplier"
        options={{
          title: 'Supplier',
          tabBarIcon: ({ color }) => <MaterialIcons name="person-pin" size={24} color={color} />,
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
          tabBarIcon: ({ color }) => <FontAwesome5 name="file-invoice" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}

function RetailerTabBar({ state, descriptors }: any) {
  const router = useRouter();

  return (
    <View className="flex-row bg-white border-t border-gray-200 pb-safe">
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
            className="flex-1 items-center justify-center py-2 bg-white"
          >
            {/* Icon container */}
            <View className={`px-5 py-1.5 rounded-full mb-1 ${isFocused ? 'bg-[#E8F5E9]' : 'bg-transparent'}`}>
              {options.tabBarIcon?.({ 
                color: isFocused ? '#2E7D32' : '#9CA3AF',
                focused: isFocused, 
                size: 22 
              })}
            </View>
            
            {/* Label */}
            <Text 
              className={`text-[10px] ${
                isFocused ? 'text-black font-bold' : 'text-gray-500 font-medium'
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