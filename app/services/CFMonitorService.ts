import { getDatabase, ref, onValue, onChildAdded } from "firebase/database";
import { app } from "@/config/firebase"; // Ensure Firebase is configured
import * as Notifications from "expo-notifications";

// Monitor price changes for a crypto
const monitorCryptoPrice = (cryptoId: string, callback: (price: number) => void) => {
  const db = getDatabase(app);
  const cryptoRef = ref(db, `cryptomonnaie/${cryptoId}/valeur_actuelle`); // Reference to the crypto's current value

  onValue(cryptoRef, (snapshot) => {
    const price = snapshot.val();
    if (price !== null) {
      callback(price);
    }
  });
};

// Monitor transactions for a crypto
const monitorCryptoTransactions = (cryptoId: string, callback: (transaction: any) => void) => {
  const db = getDatabase(app);
  const transactionsRef = ref(db, `transaction_crypto`); // Reference to all crypto transactions

  onChildAdded(transactionsRef, (snapshot) => {
    const transaction = snapshot.val();
    if (transaction.id_cryptomonnaie === parseInt(cryptoId)) { // Check if the transaction is for the favorited crypto
      callback(transaction);
    }
  });
};

// Send a notification
const sendNotification = async (expoPushToken: string, title: string, body: string) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger: null, // Send immediately
  });
};

/**
 * Monitor a user's favorite cryptocurrencies and send notifications for price updates or transactions.
 * @param userId - The ID of the user.
 * @param expoPushToken - The Expo Push Token for sending notifications.
 */
export const monitorUserFavorites = (userId: string, expoPushToken: string) => {
  const db = getDatabase(app);
  const favoritesRef = ref(db, `users/${userId}/favoris`); // Reference to the user's favorites

  onValue(favoritesRef, (snapshot) => {
    const favorites = snapshot.val(); // Get the favorites data

    if (!favorites) {
      console.log('No favorites found for user:', userId);
      return;
    }

    // Ensure favorites is an array of booleans
    const favoritesArray: boolean[] = Object.values(favorites).filter((value) => typeof value === 'boolean');

    // Loop through the favorites array
    favoritesArray.forEach((isFavorite: boolean, index: number) => {
      if (isFavorite) {
        const cryptoId = index.toString(); // Convert the index to a string (cryptoId)

        // Monitor price changes for the favorited crypto
        monitorCryptoPrice(cryptoId, (price) => {
          console.log(`New price for crypto ${cryptoId}: $${price}`);
          sendNotification(
            expoPushToken,
            "Price Update",
            `Crypto ${cryptoId} is now at $${price}!`
          );
        });

        // Monitor transactions for the favorited crypto
        monitorCryptoTransactions(cryptoId, (transaction) => {
          console.log(`New transaction for crypto ${cryptoId}:`, transaction);
          sendNotification(
            expoPushToken,
            "New Transaction",
            `A new transaction occurred for crypto ${cryptoId}.`
          );
        });
      }
    });
  });
};