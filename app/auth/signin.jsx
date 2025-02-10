import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import React, { useState, useContext, useEffect } from 'react';
import MyButton from '../../components/MyButton';
import Input from '../../components/Input';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import FirebaseService from '@/app/services/firebaseService';
import { UserDetailContext } from '@/context/userDetailContext';

export default function SignIn() {
  const [email, setEmail] = useState('user@gmail.com');  // Valeur par défaut pour l'email
  const [password, setPassword] = useState('Pass1234');  // Valeur par défaut pour le mot de passe
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { setUserDetail } = useContext(UserDetailContext);

  useEffect(() => {
    // Si tu as des valeurs stockées (ex: AsyncStorage), tu peux les récupérer ici et les définir.
    // Exemple:
    // AsyncStorage.getItem('email').then((storedEmail) => {
    //   if (storedEmail) setEmail(storedEmail);
    // });
    // AsyncStorage.getItem('password').then((storedPassword) => {
    //   if (storedPassword) setPassword(storedPassword);
    // });
  }, []);

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
      <ThemedText type="title" style={styles.title}>Connectez-vous</ThemedText>

      <Input
        placeholder="Votre email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <Input
        placeholder="Votre mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {!loading ? (
        <MyButton
          title="Se connecter"
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
    backgroundColor: '#f5f5f5', 
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    gap: 8,
  },
  input: {
    width: '100%',
    height: 50,
    paddingLeft: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 12,
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
