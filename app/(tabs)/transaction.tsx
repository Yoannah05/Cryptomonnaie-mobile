import { Image, StyleSheet, Platform } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import MyButton from '@/components/MyButton';
import Input from '../../components/Input';
import { useState } from 'react';

export default function TransactionScreen() {
  const [transactionType, setTransactionType] = useState('deposit'); // 'deposit' ou 'withdraw'
  const [amount, setAmount] = useState('');

  const handleTransaction = () => {
    // Ajoute ici la logique pour effectuer le dépôt ou le retrait
    if (!amount) {
      alert('Veuillez entrer un montant');
      return;
    }
    
    if (transactionType === 'deposit') {
      console.log(`Dépôt de ${amount} effectué`);
    } else {
      console.log(`Retrait de ${amount} effectué`);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.jpg')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Depot/Retrait</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Choisissez votre action</ThemedText>
        <ThemedText>
          Sélectionnez si vous voulez effectuer un dépôt ou un retrait.
        </ThemedText>
      </ThemedView>

      {/* Boutons de choix de type de transaction */}
      <ThemedView style={styles.transactionButtons}>
        <MyButton
          title="Dépôt"
          onPress={() => setTransactionType('deposit')}
          disable={false}
          style={transactionType === 'deposit' ? styles.activeButton : {}}
        />
        <MyButton
          title="Retrait"
          disable={false}
          onPress={() => setTransactionType('withdraw')}
          style={transactionType === 'withdraw' ? styles.activeButton : {}}
        />
      </ThemedView>

      {/* Champ de saisie du montant */}
      <Input
        placeholder="Entrez le montant"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      {/* Bouton Valider */}
      <MyButton
        title="Valider"
        onPress={handleTransaction}
        disable={!amount}
        style={false}
      />
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
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  transactionButtons: {
    flexDirection: 'row',
    gap: 16,
    marginVertical: 16,
    justifyContent: 'center',
  },
  activeButton: {
    backgroundColor: '#4CAF50', // Couleur pour le bouton actif
  },
});
