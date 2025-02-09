<<<<<<< Updated upstream
import { Image, StyleSheet, Platform } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function CryptoListScreen() {
=======
import { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Image, FlatList, TouchableOpacity, ToastAndroid, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FirebaseService from '@/app/services/firebaseService';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ref, onValue } from "firebase/database";
import { db } from '@/config/firebase'; // Assurez-vous d'importer db

export default function CryptoListScreen() {
  const [cryptos, setCryptos] = useState<{ id: string; nom_cryptomonnaie: string; valeur_actuelle: number }[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteCount, setFavoriteCount] = useState(0);

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        const data = await FirebaseService.getCryptos();
        setCryptos(data);
      } catch (error) {
        console.error('Erreur lors du chargement des cryptomonnaies', error);
      }
    };

    fetchCryptos();
  }, []);

  // 🔹 Écouter les favoris en temps réel
  useEffect(() => {
    const user = FirebaseService.getCurrentUser();
    if (!user) return;

    const userId = user.uid;
    const favoritesRef = ref(db, `users/${userId}/favoris`);

    const unsubscribe = onValue(favoritesRef, (snapshot) => {
      if (snapshot.exists()) {
        setFavorites(Object.keys(snapshot.val()));
      } else {
        setFavorites([]);
      }
    });

    return () => unsubscribe(); // Nettoyer le listener à la fin
  }, []);

  useEffect(() => {
    const user = FirebaseService.getCurrentUser();
    if (!user) return;
  
    const userId = user.uid;
    const favoritesRef = ref(db, `users/${userId}/favoris`);
  
    const unsubscribe = onValue(favoritesRef, (snapshot) => {
      if (snapshot.exists()) {
        setFavoriteCount(Object.keys(snapshot.val()).length);
      } else {
        setFavoriteCount(0);
      }
    });
  
    return () => unsubscribe();
  }, []);

  const toggleFavorite = async (id: string, name: string) => {
    try {
      const user = FirebaseService.getCurrentUser();
      if (!user) {
        console.error('No user is signed in');
        return;
      }
      const userId = user.uid;
      const isAlreadyFavorite = favorites.includes(id);
      
      if (isAlreadyFavorite) {
        await FirebaseService.removeFavoriteCrypto(userId, id);
      } else {
        await FirebaseService.addFavoriteCrypto(userId, id);
      }

      const message = isAlreadyFavorite
        ? `${name} retiré des favoris`
        : `${name} ajouté aux favoris`;

      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT);
      } else {
        Alert.alert(message);
      }
    } catch (error) {
      console.error("Erreur lors du changement de favori:", error);
    }
  };  

>>>>>>> Stashed changes
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">This is the profile screen</ThemedText>
        <ThemedText>
          this is a test <ThemedText type="defaultSemiBold">yazzz</ThemedText> right?
          Press{' '}
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
<<<<<<< Updated upstream
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
=======
  container: {
    flex: 1,
    padding: 16,  
  },
  
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: -50,
  },
  cryptoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    marginVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
>>>>>>> Stashed changes
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
