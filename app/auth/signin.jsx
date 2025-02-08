import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import React, { useState, useContext } from 'react';
import MyButton from '../../components/MyButton';
import Input from '../../components/Input';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import FirebaseService from '@/app/services/firebaseService';
import { UserDetailContext } from '@/context/userDetailContext';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { setUserDetail } = useContext(UserDetailContext);

  const signIn = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setLoading(true);

    FirebaseService.login(email, password)
      .then(async (user) => {
        console.log('User signed in:', user);
        const userData = await FirebaseService.getUserData(user.uid);
        setUserDetail(userData);
        setLoading(false);
        router.replace('/(tabs)/home');
      })
      .catch((error) => {
        console.log('Login Error:', error.message);
        switch (error.code) {
          case 'auth/invalid-email':
            Alert.alert('Error', 'Invalid email address.');
            break;
          case 'auth/user-not-found':
            Alert.alert('Error', 'User not found.');
            break;
          case 'auth/wrong-password':
            Alert.alert('Error', 'Incorrect password.');
            break;
          default:
            Alert.alert('Error', 'An error occurred. Please try again.');
        }
        setLoading(false);
      });
  };

  return (
    <ParallaxScrollView
          headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
          headerImage={
            <Image
              source={require('@/assets/images/image1.jpg')}
              style={styles.reactLogo}
            />
            
          }>
      <ThemedText type="title" style={styles.title}>Sign In</ThemedText>

      <ThemedText type="default" style={styles.label}>Email</ThemedText>
      <Input
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <ThemedText type="default" style={styles.label}>Password</ThemedText>
      <Input
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {!loading ? (
        <MyButton
          title="Login"
          onPress={signIn}
          disable={loading}
        />
      ) : (
        <ActivityIndicator size="large" color="blue" />
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',  // Light background color for a modern feel
    paddingHorizontal: 20,
    paddingBottom: 40, // Added bottom padding to keep the button from being too close to the edge
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  input: {
    width: '100%',
    height: 50,
    paddingLeft: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
    borderColor: '#ddd',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  reactLogo: {
    width: '100%',
    height: 250,
  },
});
