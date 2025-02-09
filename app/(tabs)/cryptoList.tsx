import { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FirebaseService from '@/app/services/firebaseService';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ToastAndroid, Platform, Alert } from 'react-native';

export default function CryptoListScreen() {
  const [cryptos, setCryptos] = useState<{ id: string; nom_cryptomonnaie: string; valeur_actuelle: number }[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

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
        console.log(`Retirer ${name} des favoris`);
        await FirebaseService.removeFavoriteCrypto(userId, id);
      } else {
        console.log(`Ajouter ${name} aux favoris`);
        await FirebaseService.addFavoriteCrypto(userId, id);
      }
  
      setFavorites((prevFavorites) => {
        const newFavorites = isAlreadyFavorite
          ? prevFavorites.filter((favId) => favId !== id)
          : [...prevFavorites, id];
  
        const message = isAlreadyFavorite
          ? `${name} retiré des favoris`
          : `${name} ajouté aux favoris`;
  
        if (Platform.OS === 'android') {
          ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
          Alert.alert('Favoris', message);
        }
  
        return newFavorites;
      });
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
    marginBottom: 16,
  },
  cryptoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
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
