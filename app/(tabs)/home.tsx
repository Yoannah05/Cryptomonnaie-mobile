import { Image, StyleSheet, Platform, View } from 'react-native';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { usePushNotifications } from "@/app/services/notificationService";
import React, { useEffect, useState } from 'react';
import FirebaseService from '@/app/services/firebaseService';
import { useRouter } from 'expo-router'; // Pour la navigation
import MyButton from '@/components/MyButton'; // Importer MyButton

export default function HomeScreen() {
  const { expoPushToken } = usePushNotifications();
  const router = useRouter(); // Initialiser le routeur
  const [bitcoinPrice, setBitcoinPrice] = useState<number | null>(null); // Exemple de données en temps réel

  useEffect(() => {
    if (expoPushToken) {
      const user = FirebaseService.getCurrentUser();
      const userId = user?.uid;

      // Enregistrer le token Expo
      if (userId) {
        const tokenString = expoPushToken.data;
        FirebaseService.addExpoPushToken(userId, tokenString)
          .then(() => console.log('Expo Push Token saved successfully'))
          .catch((error) => console.error('Failed to save Expo Push Token:', error));
      } else {
        console.error('User is not authenticated. Cannot save Expo Push Token.');
      }
    }

    // Simuler des données en temps réel (exemple : prix du Bitcoin)
    const fetchBitcoinPrice = async () => {
      try {
        // Simuler une API pour obtenir le prix du Bitcoin
        const response = await fetch('https://api.coindesk.com/v1/bpi/currentprice/BTC.json');
        const data = await response.json();
        setBitcoinPrice(data.bpi.USD.rate_float);
      } catch (error) {
        console.error('Error fetching Bitcoin price:', error);
      }
    };

    fetchBitcoinPrice();
  }, [expoPushToken]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.jpg')} 
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Cryptomonnaie</ThemedText>
        <HelloWave />
      </ThemedView>
      {/* Section de bienvenue */}
      <ThemedView style={styles.welcomeContainer}>
        <ThemedText type="subtitle">Bienvenue dans notre application de Cryptomonnaie</ThemedText>
        <ThemedText style={styles.welcomeText}>
          Gérez vos portefeuilles, suivez les tendances du marché et restez informé des dernières actualités.
        </ThemedText>
      </ThemedView>

      {/* Statistiques en temps réel */}
      <ThemedView style={styles.statsContainer}>
        <ThemedText type="subtitle">Prix du Bitcoin (BTC)</ThemedText>
        <ThemedText style={styles.statValue}>
          {bitcoinPrice ? `$${bitcoinPrice.toLocaleString()}` : 'Chargement...'}
        </ThemedText>
      </ThemedView>

      {/* Boutons de navigation avec MyButton */}
      <ThemedView style={styles.buttonContainer}>
        <MyButton
          title="Voir les Cryptos"
          onPress={() => router.push('/cryptoList')} // Naviguer vers la liste des cryptos
          disable={false}
          style={styles.customButton}
        />
        <MyButton
          title="Mon Portefeuille"
          onPress={() => router.push('/portefeuille')} // Naviguer vers le portefeuille
          disable={false}
          style={styles.customButton}
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
    marginBottom: 20,
  },
  reactLogo: {
    width: '100%',
    height: 250,
    resizeMode: 'cover', // Pour que l'image couvre toute la largeur
  },
  welcomeContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    elevation: 3, // Ombre pour Android
    shadowColor: '#000', // Ombre pour iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  statsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007BFF',
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  customButton: {
    flex: 1, // Permet aux boutons de prendre un espace égal
    marginHorizontal: 5, // Espacement horizontal entre les boutons
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});