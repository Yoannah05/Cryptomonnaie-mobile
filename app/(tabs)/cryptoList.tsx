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

  //Écouter les favoris en temps réel
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

  return (
    <View style={{ flex: 1 }}>
      <ParallaxScrollView
        headerImage={<Image source={require('@/assets/images/partial-react-logo.jpg')} style={{ width: '100%', height: 250 }} />}
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      />
      <ThemedView style={styles.container}>
        <Text style={styles.title}>Liste des Cryptomonnaies</Text>
        <FlatList
          data={cryptos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.cryptoItem}>
              <Text style={styles.cryptoName}>{item.nom_cryptomonnaie}</Text>
              <Text style={styles.cryptoValue}>{item.valeur_actuelle} USD</Text>
              <TouchableOpacity onPress={() => toggleFavorite(item.id, item.nom_cryptomonnaie)}>
                <Ionicons
                  name={favorites.includes(item.id) ? 'heart' : 'heart-outline'}
                  size={24}
                  color={favorites.includes(item.id) ? 'red' : 'gray'}
                />
              </TouchableOpacity>
            </View>
          )}
        />
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  },
  cryptoName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cryptoValue: {
    fontSize: 14,
    color: 'gray',
  },
});
