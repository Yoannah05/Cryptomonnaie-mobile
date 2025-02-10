import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useEffect, useState } from 'react';
import { ref, get } from "firebase/database";
import { db } from '@/config/firebase';
import { StyleSheet } from 'react-native';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
}

export default function NotificationDetails() {
  const { notificationId } = useLocalSearchParams();
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        // Check if notificationId is defined
        if (!notificationId) {
          setError("Notification ID is missing.");
          setLoading(false);
          return;
        }

        // Fetch the notification from Firebase
        const notificationRef = ref(db, `notifications/${notificationId}`);
        const snapshot = await get(notificationRef);

        if (snapshot.exists()) {
          const notificationData = snapshot.val();
          setNotification({
            id: notificationId as string,
            title: notificationData.title || "No Title", // Fallback for missing title
            message: notificationData.message || "No Message", // Fallback for missing message
            timestamp: notificationData.timestamp || Date.now(), // Fallback for missing timestamp
          });
        } else {
          setError("Notification not found.");
        }
      } catch (error) {
        console.error("Error fetching notification:", error);
        setError("Failed to fetch notification. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotification();
  }, [notificationId]);

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.loadingText}>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </ThemedView>
    );
  }

  if (!notification) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>No notification data available.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Notification Details
      </ThemedText>
      <ThemedView style={styles.detailsContainer}>
        <ThemedText style={styles.label}>Title:</ThemedText>
        <ThemedText style={styles.value}>{notification.title}</ThemedText>

        <ThemedText style={styles.label}>Message:</ThemedText>
        <ThemedText style={styles.value}>{notification.message}</ThemedText>

        <ThemedText style={styles.label}>Date:</ThemedText>
        <ThemedText style={styles.value}>
          {new Date(notification.timestamp).toLocaleString()}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F7F7F7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 10,
  },
  value: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#FF0000',
    textAlign: 'center',
    marginTop: 20,
  },
});