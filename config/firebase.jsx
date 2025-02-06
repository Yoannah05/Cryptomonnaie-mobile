import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, GoogleAuthProvider, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyDaUIkNWzUjvaqIfB2jiUgFzAGbYy5eme4",
  authDomain: "crypto-2025.firebaseapp.com",
  projectId: "crypto-2025",
  storageBucket: "crypto-2025.appspot.com",
  messagingSenderId: "1045796658129",
  appId: "1:1045796658129:android:943f8968ede3e761871ef0",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth with persistence
const auth = initializeAuth(app, {
  // persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

const googleProvider = new GoogleAuthProvider();

export { db, auth, googleProvider };
