import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { useEffect, useState } from "react";
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import FirebaseService from "@/app/services/firebaseService";
import { db } from "@/config/firebase";
import { ref, onValue } from "firebase/database";
import { Badge } from "react-native-elements";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  // Ajout de l'état pour stocker le nombre de favoris
  const [favoriteCount, setFavoriteCount] = useState(0);

  useEffect(() => {
    const user = FirebaseService.getCurrentUser();
    if (!user) return;
  
    const userId = user.uid;
    const favoritesRef = ref(db, `users/${userId}/favoris`);
  
    const unsubscribe = onValue(favoritesRef, (snapshot) => {
      if (!snapshot.exists()) {
        setFavoriteCount(0);
        return;
      }
      setFavoriteCount(Object.keys(snapshot.val()).length);
    });
  
    return () => unsubscribe();
  }, []);

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
        name="home"
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
        tabBarIcon: ({ color }) => <Ionicons size={28} name="cash" color={color} />, 
      }}
    />
    <Tabs.Screen
      name="transaction"
      options={{
        title: 'Transactions',
        tabBarIcon: ({ color }) => <Ionicons size={28} name="wallet" color={color} />,
      }}
    />

      <Tabs.Screen
        name="cryptoList"
        options={{
          title: 'Crypto List',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="cash" color={color} />,
        }}
      />
      <Tabs.Screen
        name="cours"
        options={{
          title: 'Cours',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="bar-chart" color={color} />,
        }}
      />

      <Tabs.Screen
        name="transaction"
        options={{
          title: 'Dépôt/Retrait',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="arrow-down-circle" color={color} />,
        }}
      />

      <Tabs.Screen
        name="portefeuille"
        options={{
          title: 'Portefeuille',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="wallet" color={color} />,
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="notifications" color={color} />,
        }}
      />

      <Tabs.Screen
        name="favoris"
        options={{
          title: "Favoris",
          tabBarIcon: ({ color }) => (
            <View>
              <Ionicons size={28} name="star" color={color} />
              {favoriteCount > 0 && (
                <Badge
                  value={favoriteCount}
                  status="error"
                  containerStyle={{
                    position: "absolute",
                    top: -5,
                    right: -5,
                  }}
                />
              )}
            </View>
          ),
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