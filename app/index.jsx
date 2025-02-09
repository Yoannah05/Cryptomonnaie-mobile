import { Image, StyleSheet, Platform, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation for redirection
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/config/firebase';
import FirebaseService from '@/app/services/firebaseService';
import MyButton from '@/components/MyButton';
import React, { useState, useEffect } from 'react';
import * as Notifications from "expo-notifications";
import { usePushNotifications, createCampaign } from "@/app/services/notificationService";
import { monitorUserFavorites } from "@/app/services/CFMonitorService";
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});
export default function Index() {
  const router = useRouter();
  const { expoPushToken } = usePushNotifications();

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log(user);
      const userData = await FirebaseService.getUserData(user?.uid);
      console.log("User Data:", userData);
      router.replace('/(tabs)/home');
    }
  });
  useEffect(() => {
    if (expoPushToken) {
      console.log("Expo Push Token:", expoPushToken.data);
    }
  }, [expoPushToken]);

  useEffect(() => {
    if (expoPushToken) {
      const user = FirebaseService.getCurrentUser();
      const userId = user?.uid;
      monitorUserFavorites(userId, expoPushToken.data);
    }
  }, [expoPushToken]);



  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const notificationData = response.notification.request.content.data;
      
      if (notificationData && notificationData.notificationId) {
        router.push(`/(tabs)/notifications/${notificationData.notificationId}`);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);
  
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/image1.jpg')}
          style={styles.reactLogo}
        />
        
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Bienvenu dans le monde de la cryptomonnaie</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Get Started</ThemedText>
        <ThemedText>
          Join the revolution and start your journey with Bitcoin today. Create an account or log in to explore the world of cryptocurrencies.
        </ThemedText>
        <MyButton
          title="Login"
          onPress={() => router.push('/auth/signin')} 
          disable={false}
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 16, // Increased margin for better spacing
  },
  reactLogo: {
    width: '100%',
    height: 250,
  },
});