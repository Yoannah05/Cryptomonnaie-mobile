import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import FirebaseService from '../services/firebaseService';
import ProfilePicture from '@/components/ProfilePicture';
import { useRouter } from 'expo-router';
import { DocumentData } from 'firebase/firestore';
import MyButton from '@/components/MyButton';

interface UserData {
  name: string;
  email: string;
  profilePhoto: string | null;
}

const ProfileScreen = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isUploading, setIsUploading] = useState(false); // To handle the uploading state
  const user = FirebaseService.getCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      FirebaseService.getUserData(user.uid)
        .then((data: DocumentData | null) => {
          if (data) {
            const userData = data as UserData; // Type assertion
            console.log('Fetched user data:', userData); // Log the fetched data
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
        <Text style={styles.email}>Email: {user?.email}</Text>
        <ProfilePicture
          currentPhotoUrl={userData?.profilePhoto || null} // Pass null if userData is null
          onPhotoUpdate={handlePhotoUpdate}
          setIsUploading={setIsUploading}
        />
        {userData && (
          <Text style={styles.name}>Name: {userData.name}</Text>
        )}
        <MyButton
          title="Logout"
          onPress={handleLogout}
          disable={isUploading} // Disable the logout button while uploading
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  profileContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  email: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default ProfileScreen;