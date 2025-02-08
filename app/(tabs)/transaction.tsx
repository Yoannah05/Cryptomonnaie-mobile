import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { auth, db } from '@/config/firebase';
import { collection, addDoc, Timestamp, doc } from 'firebase/firestore';

export default function TransactionScreen() {
  const [montant, setMontant] = useState('');

  const handleDepot = async () => {
    if (!montant || isNaN(Number(montant))) {
      Alert.alert('Erreur', 'Veuillez saisir un montant valide.');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Erreur', 'Utilisateur non connecté.');
      return;
    }

    try {
      // Ajouter la transaction dans transaction_monnaie
      const transactionRef = await addDoc(collection(db, 'transaction_monnaie'), {
        valeur: Number(montant),
        is_entree: true,
        is_valide: false,
        id_utilisateur: `projects/crypto-2025/databases/(default)/documents/users/${user.uid}`,
      });

      // Ajouter une entrée dans historique_individu
      await addDoc(collection(db, 'historique_individu'), {
        date_historique: Timestamp.now(), // Date actuelle
        id_transaction_monnaie: `projects/crypto-2025/databases/(default)/documents/transaction_monnaie/${transactionRef.id}`,
      });

      Alert.alert('Succès', 'Dépôt enregistré avec succès ! Vérifiez votre email pour confirmation.');
      setMontant('');
    } catch (error) {
      console.error('Erreur lors du dépôt :', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors du dépôt.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Faire un dépôt</ThemedText>
      <Text style={styles.label}></Text>
      <TextInput
        style={styles.input}
        placeholder="Montant à déposer"
        keyboardType="numeric"
        value={montant}
        onChangeText={setMontant}
      />
      <Button title="Déposer" onPress={handleDepot} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
});
