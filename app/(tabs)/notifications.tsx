import React, { useEffect, useState } from 'react';
import { FlatList, View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router'; // Import useRouter for navigation
import * as Notifications from 'expo-notifications'; // Import Expo Notifications

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState<any[]>([]); // Local state for notifications
  const router = useRouter(); // Initialize the router

  // Handle notification press (navigates to notification details page)
  const handleNotificationPress = (notificationId: string) => {
    router.push(`../../components/${notificationId}`);
  };

  // Listen for incoming notifications
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      // Add the new notification to the local state
      setNotifications((prev) => [
        ...prev,
        {
          id: notification.request.identifier,
          message: notification.request.content.body,
          timestamp: new Date(notification.date).getTime(),        
        },
      ]);
    });

    return () => subscription.remove(); // Cleanup listener
  }, []);

  // Render each notification item
  const renderItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        onPress={() => handleNotificationPress(item.timestamp?.toString() || 'unknown')} // Fallback for missing timestamp
        style={styles.notificationContainer}
      >
        <View style={styles.notificationHeader}>
          <ThemedText type="subtitle">{item.message || 'No message'}</ThemedText>
          <ThemedText type="default" style={styles.dateText}>
            {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Unknown date'}
          </ThemedText>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Notifications</ThemedText>
      </View>

      {/* Render the notifications list */}
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.timestamp?.toString() || 'unknown'} // Fallback for missing timestamp
        contentContainerStyle={styles.notificationList}
        ListEmptyComponent={
          <ThemedText style={styles.emptyText}>No notifications found.</ThemedText>
        }
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    paddingTop: 20,
    paddingHorizontal: 16,
    marginTop: 50,
  },
  header: {
    marginBottom: 16,
    alignItems: 'center',
  },
  notificationList: {
    paddingBottom: 20,
  },
  notificationContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 16,
    padding: 16,
    elevation: 3, // Shadow effect (Android)
    shadowColor: '#000', // Shadow effect (iOS)
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#888',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
});

export default NotificationsScreen;