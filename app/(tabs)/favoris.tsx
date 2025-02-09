import { useEffect, useState } from "react";
import { db } from "@/config/firebase";
import { ref, get, remove } from "firebase/database";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import FirebaseService from '@/app/services/firebaseService';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { onValue } from "firebase/database";
import { Badge } from "react-native-elements"; // Ajout du Badge

// Type des données des cryptomonnaies
type FavoriteCrypto = {
  id: string;
  nom: string;
  valeur_actuelle: number;
};

const FavoriteCryptosScreen = () => {
  const [favorites, setFavorites] = useState<FavoriteCrypto[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0); // 🔔 État du badge de notification

  useEffect(() => {
    const user = FirebaseService.getCurrentUser();
    if (!user) return;
    
    const userId = user.uid;
    const favoritesRef = ref(db, `users/${userId}/favoris`);
  
    const unsubscribe = onValue(favoritesRef, async (snapshot) => {
      if (!snapshot.exists()) {
        setFavorites([]);
        setLoading(false);
        setNotificationCount(0); // Réinitialiser le badge si aucun favori
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
      setLoading(false);
      setNotificationCount(favoriteCryptos.length); // Met à jour le badge avec le nombre de favoris
    });
  
    return () => unsubscribe(); // Nettoyage du listener
  }, []);

  // Fonction pour supprimer une cryptomonnaie des favoris
  const handleRemoveFavorite = async (cryptoId: string) => {
    try {
      const user = FirebaseService.getCurrentUser();
      if (!user) {
        console.error('No user is signed in');
        return;
      }
      const userId = user.uid;
      const favoriteRef = ref(db, `users/${userId}/favoris/${cryptoId}`);

      await remove(favoriteRef);

      // Mise à jour de l'état local après suppression
      setFavorites((prevFavorites) => prevFavorites.filter((crypto) => crypto.id !== cryptoId));
      setNotificationCount((prev) => Math.max(0, prev - 1)); // Décrémenter le badge sans descendre sous 0
    } catch (error) {
      console.error("Erreur lors de la suppression du favori :", error);
    }
  };

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
      <View style={styles.header}>
        <Text style={styles.title}>Cryptomonnaies Favorites</Text>

        {/* 🔔 Icône de cloche avec badge de notification */}
        <TouchableOpacity style={styles.notificationIcon}>
          <MaterialCommunityIcons name="bell" size={28} color="#4CAF50" />
          {notificationCount > 0 && (
            <Badge value={notificationCount} status="error" containerStyle={styles.badge} />
          )}
        </TouchableOpacity>
      </View>

      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.cryptoItem}>
              <View style={styles.cryptoInfo}>
                <Text style={styles.cryptoName}>{item.nom}</Text>
                <Text style={styles.cryptoValue}>{item.valeur_actuelle} MGA</Text>
              </View>
              
              {/* 🔹 Icône de suppression */}
              <TouchableOpacity onPress={() => handleRemoveFavorite(item.id)}>
                <MaterialCommunityIcons name="delete" size={24} color="red" />
              </TouchableOpacity>
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
    paddingVertical: 40,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    paddingTop : 8,
    fontSize: 24,
    fontWeight: "bold",
    color: "#2F4F4F",
  },
  notificationIcon: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -1,
    right: -3,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cryptoInfo: {
    flexDirection: "column",
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
    fontSize: 16,
    color: "#777",
    marginTop: 30,
  },
});

export default FavoriteCryptosScreen;
