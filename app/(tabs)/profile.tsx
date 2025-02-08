import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import FirebaseService from '../services/firebaseService';
import ProfilePicture from '@/components/ProfilePicture';
import { useRouter } from 'expo-router';
import { DocumentData } from 'firebase/firestore';
import MyButton from '@/components/MyButton';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';

interface UserData {
  name: string;
  email: string;
  profilePhoto: string | null;
}

const ProfileScreen = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isUploading, setIsUploading] = useState(false); 
  const user = FirebaseService.getCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      FirebaseService.getUserData(user.uid)
        .then((data: DocumentData | null) => {
          if (data) {
            const userData = data as UserData; 
            console.log('Fetched user data:', userData);
            setUserData(userData);
          }
        })
        .catch((error) => {
          Alert.alert('Error', 'Failed to fetch user data');
        });
    }
  }, [user]);

  const handleLogout = async () => {
    await FirebaseService.logout();
    router.replace('/');
  };

  const handlePhotoUpdate = async (newPhotoUrl: string) => {
    if (user) {
      try {
        await FirebaseService.updateUserProfilePhoto(user.uid, newPhotoUrl);
        if (userData) {
          setUserData({ ...userData, profilePhoto: newPhotoUrl });
        } else {
          setUserData({
            name: 'Unknown', // Default name
            email: user.email || 'Unknown', // Default email
            profilePhoto: newPhotoUrl,
          });
        }
      } catch (error) {
        console.error('Failed to update profile photo in Firebase:', error);
        Alert.alert('Error', 'Failed to save the profile photo. Please try again.');
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileContainer}>
        {/* Profile Picture */}
        <ProfilePicture
          currentPhotoUrl={userData?.profilePhoto || null} 
          onPhotoUpdate={handlePhotoUpdate}
          setIsUploading={setIsUploading}
        />

        {/* User Details */}
        <View style={styles.userDetailsContainer}>
          {userData && (
            <>
              <Text style={styles.name}>{userData.name}</Text>
              <ThemedText style={styles.email} type="subtitle">{userData.email}</ThemedText>
            </>
          )}
        </View>

        {/* Logout Button */}
        <MyButton
          title="Logout"
          onPress={handleLogout}
          disable={isUploading}
          style={styles.logoutButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  userDetailsContainer: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 30,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginHorizontal: 10,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignSelf: 'center',
  },
});

export default ProfileScreen;
