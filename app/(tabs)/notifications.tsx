import React from 'react';
import { FlatList, View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { usePushNotifications } from '@/app/services/notificationService';
import { useRouter } from 'expo-router'; // Import useRouter for navigation

const NotificationsScreen = () => {
  const { campaigns } = usePushNotifications(); // Fetch campaigns (notifications)
  const router = useRouter(); // Initialize the router

  // Handle notification press
  const handleNotificationPress = (notificationId: string) => {
    router.push(`/notifications/${notificationId}`);
  };

  // Render each notification item
  const renderItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        onPress={() => handleNotificationPress(item.id)} // Handle press on notification
        style={styles.notificationContainer}
      >
        <View style={styles.notificationHeader}>
          <ThemedText type="subtitle">{item.title}</ThemedText>
          <ThemedText type="default" style={styles.dateText}>
            {new Date(item.dateCreated).toLocaleString()} {/* Format the date */}
          </ThemedText>
        </View>
        <ThemedText style={styles.notificationBody}>{item.message}</ThemedText>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Notifications</ThemedText>
      </View>

      <FlatList
        data={campaigns}
        renderItem={renderItem}
        keyExtractor={(item) => item.id} // Use a unique key for each notification
        contentContainerStyle={styles.notificationList}
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
  notificationBody: {
    fontSize: 14,
    color: '#333',
  },
});

export default NotificationsScreen;