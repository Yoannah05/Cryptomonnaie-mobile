import { Image, StyleSheet, Platform, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation for redirection
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { getUserDetail} from './services/firebaseService';

export default function Index() {
  const router = useRouter();

  onAuthStateChanged(auth, async(user) => {
    if (user) {
      console.log(user);
      getUserDetail(user?.uid);
      router.replace('/(tabs)/home')
    }
  })

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome to Crypto World!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Get Started</ThemedText>
        <ThemedText>
          Join the revolution and start your journey with Bitcoin today. Create an account or log in to explore the world of cryptocurrencies.
        </ThemedText>
        <Button
          title="Login"
          onPress={() => router.push('/auth/signin')} 
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 16, // Increased margin for better spacing
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});