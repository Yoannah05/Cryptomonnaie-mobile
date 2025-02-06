import { View, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import MyButton from '../../components/MyButton';
import Input from '../../components/Input';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { SaveUser } from '../services/firebaseService.jsx';
import { auth } from '../../config/firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider  } from 'firebase/auth';

export default function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const signUpEmail = () => {
        console.log('Sign Up pressed');
        createUserWithEmailAndPassword(auth, email, password)
            .then(async (resp) => {
                const user = resp.user;
                await SaveUser(user, email);  // Pass email to SaveUser
                router.replace('/(tabs)/home');
            })
            .catch(e => {
                console.log(e.message);
            });
    };

    const signUpGoogle = async () => {
        try {
          // Request Google Sign-In
          const provider = new auth.GoogleAuthProvider();
          const result = await auth().signInWithPopup(provider);
          const user = result.user;
          
          console.log('Google Sign-In Success:', user);
          router.replace('/(tabs)/home');
        } catch (error) {
          console.log('Google Sign-In Error:', error.message);
        }
      };

    return (
        <ThemedView style={styles.container}>
            <ThemedText type="title" style={styles.title}>Sign Up</ThemedText>
            <Input
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
            />
            <Input
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />
            <MyButton
                title="Sign Up with Email"
                onPress={signUpEmail}
                style={styles.button}
            />

            <ThemedText type="default" style={styles.orText}>OR</ThemedText>

            <MyButton
                title="Sign Up with Google"
                onPress={signUpGoogle}
                style={styles.googleButton}
            />

            <ThemedText type="default" >
                Already have an account?{' '}
                <TouchableOpacity onPress={() => router.push('/auth/signin')}>
                    <ThemedText type="link">Sign In here</ThemedText>
                </TouchableOpacity>
            </ThemedText>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    orText: {
        marginVertical: 10,
    },
});