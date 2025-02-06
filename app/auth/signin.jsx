import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useContext } from 'react';
import MyButton from '../../components/MyButton';
import Input from '../../components/Input';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { app, auth } from '../../config/firebase';
import { getUserDetail } from '../services/firebaseService.jsx';
import { UserDetailContext } from '../../context/userDetailContext'; // Assuming UserDetailContext exists

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { setUserDetail } = useContext(UserDetailContext); // Assuming UserDetailContext is used to manage user data

    const signIn = () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
        setLoading(true);

        signInWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                const user = userCredential.user;
                console.log('User signed in:', user);

                // Fetch user details and update context/state
                await getUserDetail(user?.uid, setUserDetail); // Pass setUserDetail to update user data in context/state

                setLoading(false);
                router.replace('/(tabs)/home');
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log('Login Error:', errorMessage);
                switch (errorCode) {
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
                setLoading(false); // Make sure loading is set to false after the error
            });
    };

    return (
        <ThemedView style={styles.container}>
            <ThemedText type="title" style={styles.title}>Sign In</ThemedText>
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
            {!loading ? (
                <MyButton
                    title="Login"
                    onPress={signIn}
                    disable={loading}
                    style={styles.button}
                    textStyle={styles.buttonText}
                />
            ) : (
                <ActivityIndicator size="large" color="#007bff" /> // You can adjust the color if needed
            )}

            <ThemedText type="default">Doesn't Have an account?
                <TouchableOpacity onPress={() => router.push('/auth/signup')}>
                    <ThemedText type="link"> Register here</ThemedText>
                </TouchableOpacity>
            </ThemedText>

            <TouchableOpacity onPress={() => console.log('Forgot password pressed')}>
                <ThemedText type="link"> Forgot Password</ThemedText>
            </TouchableOpacity>
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
    input: {
        width: '100%',
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#007bff',
        width: '100%',
        padding: 15,
        borderRadius: 5,
        marginBottom: 15,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
    },
});
