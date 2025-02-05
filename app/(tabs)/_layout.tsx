import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      
       <Tabs.Screen
      name="cryptoList"
      options={{
        title: 'Crypto List',
        tabBarIcon: ({ color }) => <Ionicons size={28} name="list" color={color} />, 
      }}
    />
    <Tabs.Screen
      name="cours"
      options={{
        title: 'Current Price',
        tabBarIcon: ({ color }) => <Ionicons size={28} name="cash" color={color} />, // Cash or price-related icon
      }}
    />
    <Tabs.Screen
      name="transaction"
      options={{
        title: 'Transactions',
        tabBarIcon: ({ color }) => <Ionicons size={28} name="wallet" color={color} />, // Wallet icon for crypto transactions
      }}
    />

    <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="person" color={color} />, 
        }}
      />
    </Tabs>
  );
}
