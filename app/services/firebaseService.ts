import { auth, db, googleProvider } from "@/config/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { ref, set, get, child, update } from "firebase/database";  // Importation des fonctions de Realtime Database

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

  getCryptos: async () => {
    try {
      const cryptosRef = ref(db, "cryptomonnaie");  // Référence vers les cryptos dans Realtime Database
      const snapshot = await get(cryptosRef);  // Utilisation de get() pour obtenir les données

      if (snapshot.exists()) {
        return snapshot.val();  // Retourne les données sous forme d'objet
      } else {
        console.log("No data available");
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
