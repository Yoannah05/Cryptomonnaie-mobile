import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase, ref, set, get, child, update } from "firebase/database";  // Importation des fonctions Realtime Database

import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyDaUIkNWzUjvaqIfB2jiUgFzAGbYy5eme4",
  authDomain: "crypto-2025.firebaseapp.com",
  databaseURL: "https://crypto-2025-default-rtdb.europe-west1.firebasedatabase.app",  // Ajout de l'URL pour Realtime Database
  projectId: "crypto-2025",
  storageBucket: "crypto-2025.appspot.com",
  messagingSenderId: "1045796658129",
  appId: "1:1045796658129:android:943f8968ede3e761871ef0",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
const db = getDatabase(app);

// Initialize Auth
const auth = initializeAuth(app, {
  // persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

const googleProvider = new GoogleAuthProvider();

export { db, auth, googleProvider, app };
