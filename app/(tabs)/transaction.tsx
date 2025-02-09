import { Image, StyleSheet } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import MyButton from '@/components/MyButton';
import Input from '../../components/Input';
import { useState } from 'react';
import { getAuth } from "firebase/auth";

export default function TransactionScreen() {
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');

  const handleTransaction = async () => {
    if (!amount) {
      alert("Veuillez entrer un montant");
      return;
    }
  
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (!user) {
      alert("Utilisateur non authentifié !");
      return;
    }
  
    try {
      const accessToken = await user.getIdToken();
  
      const transactionData = {
        id_utilisateur: user.uid,
        is_entree: transactionType === "deposit",
        is_valide: false,
        valeur: parseFloat(amount),
      };

      console.log("Données envoyées :", transactionData);
  
      const response = await fetch(
        `https://crypto-2025-default-rtdb.europe-west1.firebasedatabase.app/transaction_monnaie.json?auth=${accessToken}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transactionData),
        }
      );
  
      const responseData = await response.json();
      console.log("Réponse Firebase:", responseData);
  
      if (response.ok) {
        alert(`Transaction de ${transactionType === "deposit" ? "dépôt" : "retrait"} effectuée`);
        setAmount("");
      } else {
        alert("Erreur : " + JSON.stringify(responseData));
      }
    } catch (error) {
      console.error("Erreur transaction :", error);
      alert("Une erreur est survenue");
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image source={require('@/assets/images/partial-react-logo.jpg')} style={styles.reactLogo} />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Dépôt/Retrait</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Choisissez votre action</ThemedText>
      </ThemedView>

      {/* Boutons de choix */}
      <ThemedView style={styles.transactionButtons}>
        <MyButton
          title="Dépôt"
          onPress={() => setTransactionType('deposit')}
          disable={transactionType === 'deposit'}
          style={transactionType === 'deposit' ? styles.activeButton : styles.disabledButton}
        />
        <MyButton
          title="Retrait"
          onPress={() => setTransactionType('withdraw')}
          disable={transactionType === 'withdraw'}
          style={transactionType === 'withdraw' ? styles.activeButton : styles.disabledButton}
        />
      </ThemedView>

      {/* Champ de saisie */}
      <Input
        placeholder="Entrez le montant"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      {/* Bouton Valider */}
      <MyButton title="Valider" onPress={handleTransaction} disable={!amount} style={undefined} />
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
    width: '100%',
    height: 250,
  },
  transactionButtons: {
    flexDirection: 'row',
    gap: 16,
    marginVertical: 16,
    justifyContent: 'center',
  },
  activeButton: {
    backgroundColor: '#4CAF50',
<<<<<<< Updated upstream
=======
  },
  disabledButton: {
    backgroundColor: '#DEDEDE', // Gris clair pour désactivation
>>>>>>> Stashed changes
  },
  disabledButton: {
    backgroundColor: '#DEDEDE', // Gris clair pour désactivation
  },
});