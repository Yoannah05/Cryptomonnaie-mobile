import { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Image, FlatList, TouchableOpacity, ToastAndroid, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FirebaseService from '@/app/services/firebaseService';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ref, onValue } from "firebase/database";
import { db } from '@/config/firebase';

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

    return () => unsubscribe();
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
    <View style={styles.container}>
      <ParallaxScrollView
        headerImage={<Image source={require('@/assets/images/partial-react-logo.jpg')} style={styles.headerImage} />}
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      />
      <ThemedView style={styles.content}>
        <Text style={styles.title}>Liste des Cryptomonnaies</Text>
        <FlatList
          data={cryptos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.cryptoItem}>
              <View style={styles.cryptoTextContainer}>
                <Text style={styles.cryptoName}>{item.nom_cryptomonnaie}</Text>
                <Text style={styles.cryptoValue}>{item.valeur_actuelle} MGA</Text>
              </View>
              <TouchableOpacity onPress={() => toggleFavorite(item.id, item.nom_cryptomonnaie)} style={styles.favoriteButton}>
                <Ionicons
                  name={favorites.includes(item.id) ? 'heart' : 'heart-outline'}
                  size={28}
                  color={favorites.includes(item.id) ? '#FF4D4D' : '#B0B0B0'}
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
    backgroundColor: '#FAFAFA',
  },
  headerImage: {
    width: '100%',
    height: 250,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2C3E50',
    textAlign: 'center',
  },
  cryptoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cryptoTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  cryptoName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34495E',
  },
  cryptoValue: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  favoriteButton: {
    padding: 6,
    borderRadius: 50,
    backgroundColor: '#F0F0F0',
  },
});