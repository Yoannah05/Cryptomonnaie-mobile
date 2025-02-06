import { auth, db, googleProvider } from "@/config/firebase";
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { Notification } from './types';

const FirebaseService = {
  login: async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },

  signUp: async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
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
      await updateDoc(doc(db, "users", userId), updates);
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
      const userDoc = await getDoc(doc(db, "users", userId));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      throw error;
    }
  },

  updateUserProfilePhoto: async (userId: string, photoUrl: string) => {
    try {
      const userRef = doc(db, 'users', userId); // Reference to the user document

      // Check if the document exists, and create it if it doesn't
      await setDoc(userRef, { profilePhoto: photoUrl }, { merge: true });

      console.log('Profile photo updated successfully in Firebase');
    } catch (error) {
      console.error('Error updating profile photo in Firebase:', error);
      throw error;
    }
  },

  getUserNotifications: async (userId: string) => {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc') // Sort notifications by date (newest first)
      );
      const querySnapshot = await getDocs(q);

      const notifications: Notification[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notifications.push({
          id: doc.id, // This is now allowed because `id` is part of the Notification interface
          title: data.title,
          message: data.message,
          timestamp: data.timestamp.toDate(), // Convert Firestore Timestamp to Date
          isRead: data.isRead,
        });
      });

      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },
};

export default FirebaseService;
