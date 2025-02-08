import React from 'react';
import { FlatList, View, StyleSheet, Text } from 'react-native';
import { ThemedView } from '@/components/ThemedView'; // Assuming ThemedView is used for the app's styling theme
import { ThemedText } from '@/components/ThemedText'; // Assuming ThemedText is used to style text consistently
import { usePushNotifications } from '@/app/services/notificationService'; // Import your custom hook

const NotificationsScreen = () => {
  const { campaigns } = usePushNotifications(); // Fetch campaigns (notifications)

  const renderItem = ({ item }: { item: any }) => {
    return (
      <View style={styles.notificationContainer}>
        <View style={styles.notificationHeader}>
          <ThemedText type="subtitle">{item.title}</ThemedText>
          <ThemedText type="default" style={styles.dateText}>
            {new Date(item.dateCreated).toLocaleString()} {/* Format the date */}
          </ThemedText>
        </View>
        <ThemedText style={styles.notificationBody}>{item.message}</ThemedText>
      </View>
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
        keyExtractor={(item) => item.dateCreated} // Unique key for each notification
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
    marginTop:50
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
    elevation: 3, // To create a shadow effect (Android)
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
