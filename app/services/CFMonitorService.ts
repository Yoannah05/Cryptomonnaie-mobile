import { getDatabase, ref, onValue, onChildAdded } from "firebase/database";
import { app } from "@/config/firebase"; 
import * as Notifications from "expo-notifications";

// Monitor price changes for a crypto
const monitorCryptoPrice = (cryptoId: string, callback: (price: number) => void) => {
  const db = getDatabase(app);
  const cryptoRef = ref(db, `cryptos/${cryptoId}/price`);

  onValue(cryptoRef, (snapshot) => {
    const price = snapshot.val();
    callback(price);
  });
};

// Monitor transactions for a crypto
const monitorCryptoTransactions = (cryptoId: string, callback: (transaction: any) => void) => {
  const db = getDatabase(app);
  const transactionsRef = ref(db, `cryptos/${cryptoId}/transactions`);

  onChildAdded(transactionsRef, (snapshot) => {
    const transaction = snapshot.val();
    callback(transaction);
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

// Monitor user's favorite cryptos
export const monitorUserFavorites = (userId: string, expoPushToken: string) => {
  const db = getDatabase(app);
  const favoritesRef = ref(db, `users/${userId}/favorites`);

  onValue(favoritesRef, (snapshot) => {
    const favorites = snapshot.val();
    for (const cryptoId in favorites) {
      // Monitor price changes
      monitorCryptoPrice(cryptoId, (price) => {
        console.log(`New price for ${cryptoId}: $${price}`);
        sendNotification(expoPushToken, "Price Update", `${cryptoId} is now at $${price}!`);
      });

      // Monitor transactions
      monitorCryptoTransactions(cryptoId, (transaction) => {
        console.log(`New transaction for ${cryptoId}:`, transaction);
        sendNotification(expoPushToken, "New Transaction", `A new transaction occurred for ${cryptoId}.`);
      });
    }
  });
};