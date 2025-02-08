import { useEffect, useState } from "react";
import { db } from "@/config/firebase";
import { ref, get } from "firebase/database";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import FirebaseService from '@/app/services/firebaseService';

// Type des données des cryptomonnaies
type CryptoData = {
  nom: string;
  valeur_actuelle: number;
};

type FavoriteCrypto = {
  id: string;
  nom: string;
  valeur_actuelle: number;
};

const FavoriteCryptosScreen = () => {
  const [favorites, setFavorites] = useState<FavoriteCrypto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const user = FirebaseService.getCurrentUser();
        if (!user) {
          console.error('No user is signed in');
          return;
        }
        const userId = user.uid;
        const favoritesRef = ref(db, `users/${userId}/favoris`);

        const snapshot = await get(favoritesRef);
        if (!snapshot.exists()) {
          setFavorites([]);
          setLoading(false);
          return;
        }

        const favoriteIds = Object.keys(snapshot.val());
        const favoriteCryptos: FavoriteCrypto[] = [];

        for (const cryptoId of favoriteIds) {
          const cryptoRef = ref(db, `cryptomonnaie/${cryptoId}`);
          const cryptoSnapshot = await get(cryptoRef);
          if (cryptoSnapshot.exists()) {
            const cryptoData = cryptoSnapshot.val();
            favoriteCryptos.push({
              id: cryptoId,
              nom: cryptoData.nom || "Nom inconnu",
              valeur_actuelle: cryptoData.valeur_actuelle || 0,
            });
          }
        }

        setFavorites(favoriteCryptos);
      } catch (error) {
        console.error("Erreur lors de la récupération des favoris :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Chargement des favoris...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cryptomonnaies Favorites</Text>

      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.cryptoItem}>
              <Text style={styles.cryptoName}>{item.nom}</Text>
              <Text style={styles.cryptoValue}>{item.valeur_actuelle} USD</Text>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noFavorites}>Vous n'avez pas encore de favoris.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: "#F8F9FA",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2F4F4F",
    marginBottom: 20,
    textAlign: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#4CAF50",
  },
  cryptoItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3, 
  },
  cryptoName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  cryptoValue: {
    fontSize: 16,
    color: "#4CAF50",
    marginTop: 4,
  },
  noFavorites: {
    textAlign: "center",
    fontSize: 18,
    color: "#777",
    marginTop: 30,
  },
});

export default FavoriteCryptosScreen;
