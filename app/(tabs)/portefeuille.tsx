import { useEffect, useState } from "react";
import { db } from "@/config/firebase";
import { ref, onValue, off } from "firebase/database"; 
import { View, Text, ActivityIndicator, FlatList } from "react-native";

// Types
type PortefeuilleData = {
  id: string;
  valeur: number;
  id_cryptomonnaie: string;
<<<<<<< Updated upstream
  nom_cryptomonnaie?: string;
=======
  nom_cryptomonnaie?: string;  // Nom de la cryptomonnaie
>>>>>>> Stashed changes
  id_trans_crypto?: string;
  valeurTransaction?: number;
  transactionStatus?: string;
};

type TransactionData = {
  id_trans_crypto: string;
  is_entree: boolean;
  valeur: number;
};

const Portefeuille = () => {
  const [portefeuille, setPortefeuille] = useState<PortefeuilleData[]>([]);
  const [transactions, setTransactions] = useState<Record<string, TransactionData>>({});
<<<<<<< Updated upstream
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const portefeuilleRef = ref(db, "portefeuille");
    const transactionRef = ref(db, "transaction_crypto");

    // Récupérer les transactions
    onValue(transactionRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const transactionsList = Object.entries(data)
          .filter(([id, entry]) => entry !== null)
          .reduce((acc, [id, entry]: [string, any]) => {
            acc[id] = {
              id_trans_crypto: id,
              is_entree: entry.is_entree,
              valeur: entry.valeur,
            };
            return acc;
          }, {} as Record<string, TransactionData>);
        setTransactions(transactionsList);
      }
    });

=======
  const [cryptomonnaies, setCryptomonnaies] = useState<Record<string, string>>({});  // Enregistrer le nom des cryptomonnaies
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const portefeuilleRef = ref(db, "portefeuille");
    const transactionRef = ref(db, "transaction_crypto");
    const cryptomonnaieRef = ref(db, "cryptomonnaie");  // Référence pour récupérer le nom des cryptomonnaies

    // Récupérer les cryptomonnaies (nom)
    onValue(cryptomonnaieRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const cryptomonnaiesList = Object.entries(data).reduce((acc, [id, entry]: [string, any]) => {
          acc[id] = entry.nom;  // Assurez-vous que le champ 'nom' existe dans vos données
          return acc;
        }, {} as Record<string, string>);
        setCryptomonnaies(cryptomonnaiesList);
      }
    });

    // Récupérer les transactions
    onValue(transactionRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const transactionsList = Object.entries(data)
          .filter(([id, entry]) => entry !== null)
          .reduce((acc, [id, entry]: [string, any]) => {
            acc[id] = {
              id_trans_crypto: id,
              is_entree: entry.is_entree,
              valeur: entry.valeur,
            };
            return acc;
          }, {} as Record<string, TransactionData>);
        setTransactions(transactionsList);
      }
    });

>>>>>>> Stashed changes
    // Récupérer le portefeuille
    onValue(portefeuilleRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const portefeuilleList: PortefeuilleData[] = Object.entries(data).map(([id, entry]: [string, any]) => {
          const transaction = transactions[entry.id_transaction_crypto] || {};
          return {
            id,
            id_cryptomonnaie: entry.id_cryptomonnaie || "Inconnu",
<<<<<<< Updated upstream
            nom_cryptomonnaie: entry.nom || "Inconnu",
=======
            nom_cryptomonnaie: cryptomonnaies[entry.id_cryptomonnaie] || "Inconnu",  // Affichage du nom de la cryptomonnaie
>>>>>>> Stashed changes
            valeur: entry.valeur_actuelle || 0,
            id_trans_crypto: entry.id_transaction_crypto || "N/A",
            valeurTransaction: transaction.valeur || 0,
            transactionStatus: transaction.is_entree ? "Validé" : "Non validé",
          };
        });
        setPortefeuille(portefeuilleList);
      } else {
        setPortefeuille([]);
      }
      setLoading(false);
    });

    return () => {
      off(portefeuilleRef);
      off(transactionRef);
<<<<<<< Updated upstream
    };
  }, [transactions]);
=======
      off(cryptomonnaieRef);
    };
  }, [transactions, cryptomonnaies]);
>>>>>>> Stashed changes

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Chargement du portefeuille...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 40 }}>
      <Text style={{ fontSize: 30, fontWeight: "bold", marginBottom: 10 }}>💼 Mon Portefeuille</Text>
  
      {portefeuille.length > 0 ? (
        <FlatList
          data={portefeuille}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={{ paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: "#ddd" }}>
<<<<<<< Updated upstream
              <Text style={{ fontWeight: "bold", fontSize: 18 }}>{item.nom_cryptomonnaie}</Text>
              <Text>Valeur : {item.valeur} unités</Text>
              <Text>Transaction numéro : {item.id_trans_crypto}</Text>
              <Text>Valeur de la transaction : {item.valeurTransaction} unités</Text>
              <Text>Statut : {item.transactionStatus}</Text>
=======
              <Text style={{ fontWeight: "bold", fontSize : 18, marginBottom: 4 }}>Nom du crypto : {item.nom_cryptomonnaie}</Text>
              <Text style={{ marginBottom: 4 }}>Valeur : {item.valeur} MGA</Text>
              <Text style={{ marginBottom: 4 }}>Numero de la transaction : {item.id_trans_crypto}</Text>
              <Text style={{ marginBottom: 4 }}>Valeur de la transaction : {item.valeurTransaction} unités</Text>
              <Text style={{ marginBottom: 4 }}>Statut : {item.transactionStatus}</Text>
>>>>>>> Stashed changes
            </View>
          )}
        />
      ) : (
        <Text style={{ marginTop: 20 }}>Aucune cryptomonnaie dans le portefeuille.</Text>
      )}
    </View>
  );
  
};

export default Portefeuille;
