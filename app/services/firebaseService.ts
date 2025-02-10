import { auth, db, googleProvider } from "@/config/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { ref, set, get, child, update, remove } from "firebase/database";  // Importation des fonctions de Realtime Database

interface Notification {
  userId: string;
  message: string;
  timestamp: number;
  // Add any other properties specific to your notification
}

const FirebaseService = {
  login: async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },

  addExpoPushToken: async (userId: string, expoPushToken: string) => {
    try {
      const userRef = ref(db, `users/${userId}`); // Reference to the user's data
      await update(userRef, { expoPushToken }); // Update the user's data with the Expo Push Token
      console.log('Expo Push Token added/updated successfully for user:', userId);
    } catch (error) {
      console.error('Error adding/updating Expo Push Token:', error);
      throw error;
    }
  },

  removeFavoriteCrypto: async (userId: string, cryptoId: string) => {
    try {
      const userFavoritesRef = ref(db, `users/${userId}/favoris/${cryptoId}`);
      await remove(userFavoritesRef); 
      console.log(`Cryptomonnaie ${cryptoId} retirée des favoris de l'utilisateur ${userId}`);
    } catch (error) {
      console.error("Erreur lors de la suppression du favori :", error);
      throw error;
    }
  },

  addFavoriteCrypto: async (userId: string, cryptoId: string) => {
    try {
      // Référence à la liste des favoris de l'utilisateur
      const userFavoritesRef = ref(db, `users/${userId}/favoris`);

      // On ajoute la cryptomonnaie aux favoris si elle n'y est pas déjà
      await update(userFavoritesRef, {
        [cryptoId]: true,
      });

      console.log(`Cryptomonnaie ${cryptoId} ajoutée aux favoris de l'utilisateur ${userId}`);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la cryptomonnaie aux favoris :", error);
      throw error;
    }
  },

  getCryptos: async () => {
    try {
      const cryptosRef = ref(db, "cryptomonnaie");
      
      // Récupérer les données de la base Realtime Database
      const cryptosSnapshot = await get(cryptosRef);
      
      if (cryptosSnapshot.exists()) {
        const cryptosData = cryptosSnapshot.val();
        
        // Formatter les données en un tableau
        const formattedData = Object.keys(cryptosData).map((key) => ({
          id: key,
          nom_cryptomonnaie: cryptosData[key].nom || "Nom inconnu",
          valeur_actuelle: cryptosData[key].valeur_actuelle || 0,
        }));
        
        return formattedData;
      } else {
        console.log("Aucune donnée disponible");
        return [];
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des cryptos:", error);
      throw error;
    }

  },
  signUp: async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Stockage des informations utilisateurs dans Realtime Database
      await set(ref(db, 'users/' + user.uid), {
        email,
        name,
        profilePhoto: null,
      });

      return user;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (userId: string, updates: { name?: string; profilePhoto?: string }) => {
    try {
      await update(ref(db, 'users/' + userId), updates);  // Mise à jour des données utilisateur
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  },

  getCurrentUser: () => {
    return auth.currentUser;
  },

  getUserData: async (userId: string) => {
    try {
      const userRef = ref(db, 'users/' + userId);  // Référence à l'utilisateur dans Realtime Database
      const snapshot = await get(userRef);
      return snapshot.exists() ? snapshot.val() : null;  // Retourner les données si l'utilisateur existe
    } catch (error) {
      throw error;
    }
  },

  updateUserProfilePhoto: async (userId: string, photoUrl: string) => {
    try {
      const userRef = ref(db, 'users/' + userId); // Référence vers l'utilisateur
      await update(userRef, { profilePhoto: photoUrl }); // Mise à jour de la photo de profil
      console.log('Profile photo updated successfully in Firebase');
    } catch (error) {
      console.error('Error updating profile photo in Firebase:', error);
      throw error;
    }
  },

  getUserNotifications: async (userId: string): Promise<Notification[]> => {
    try {
      const notificationsRef = ref(db, 'notifications');  // Référence aux notifications
      const snapshot = await get(notificationsRef);  // Obtient les notifications
  
      if (snapshot.exists()) {
        const notifications: Notification[] = snapshot.val();  // Récupère les notifications sous forme d'objet
        return notifications.filter((notification: Notification) => notification.userId === userId);
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },
  
};

export default FirebaseService;