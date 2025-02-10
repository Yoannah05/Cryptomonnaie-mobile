import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useEffect, useState } from 'react';
import { ref, get } from "firebase/database";
import { db } from '@/config/firebase';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
}

export default function NotificationDetails() {
  const { notificationId } = useLocalSearchParams();
  const [notification, setNotification] = useState<Notification | null>(null);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const notificationRef = ref(db, `notifications/${notificationId}`);
        const snapshot = await get(notificationRef);

        if (snapshot.exists()) {
          const notificationData = snapshot.val();
          setNotification({
            id: notificationId as string,
            title: notificationData.title,
            message: notificationData.message,
            timestamp: notificationData.timestamp,
          });
        } else {
          console.log("Notification not found");
        }
      } catch (error) {
        console.error("Error fetching notification:", error);
      }
    };

    fetchNotification();
  }, [notificationId]);

  if (!notification) {
    return <ThemedText>Loading...</ThemedText>;
  }

  return (
    <ThemedView>
      <ThemedText type="title">Notification Details</ThemedText>
      <ThemedText>Title: {notification.title}</ThemedText>
      <ThemedText>Message: {notification.message}</ThemedText>
      <ThemedText>Date: {new Date(notification.timestamp).toLocaleString()}</ThemedText>
    </ThemedView>
  );
}