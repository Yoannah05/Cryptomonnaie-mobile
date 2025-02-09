import { useEffect, useState } from "react";
import { db } from "@/config/firebase";
import { ref, onValue, off } from "firebase/database"; 
import { View, Text, ActivityIndicator, FlatList } from "react-native";

// Types
type PortefeuilleData = {
  id: string;
  valeur: number;
  id_cryptomonnaie: string;
  nom_cryptomonnaie?: string;  // Nom de la cryptomonnaie
  id_trans_crypto?: string;
  valeurTransaction?: number;
  transactionStatus?: string;
};

type TransactionData = {
  id_trans_crypto: string;
  is_entree: boolean;
  valeur: number;
  id_cryptomonnaie1: string;
};

type HistoriqueIndividuData = {
  id_historique: string;
  date_historique: string;
  id_transaction_crypto_result: string;
  id_transaction_crypto_init: string;
  id_transaction_monnaie: string;
  id_utilisateur: string;
};

const dateStr = "2025-02-01T12:00:00Z";
const [date, time] = dateStr.split("T");

const Portefeuille = () => {
  const [portefeuille, setPortefeuille] = useState<PortefeuilleData[]>([]);
  const [transactions, setTransactions] = useState<Record<string, TransactionData>>({});
  const [cryptomonnaies, setCryptomonnaies] = useState<Record<string, string>>({});  // Enregistrer le nom des cryptomonnaies
  const [historiqueIndividu, setHistoriqueIndividu] = useState<HistoriqueIndividuData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const portefeuilleRef = ref(db, "portefeuille");
    const transactionRef = ref(db, "transaction_crypto");
    const cryptomonnaieRef = ref(db, "cryptomonnaie");  // Référence pour récupérer le nom des cryptomonnaies
    const historiqueRef = ref(db, "historique_individu");

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
              id_cryptomonnaie1: entry.id_cryptomonnaie,  // Ajout de l'id_cryptomonnaie
            };
            return acc;
          }, {} as Record<string, TransactionData>);
        setTransactions(transactionsList);
      }
    });

    // Récupérer le portefeuille
    onValue(portefeuilleRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const portefeuilleList: PortefeuilleData[] = Object.entries(data).map(([id, entry]: [string, any]) => {
          const transaction = transactions[entry.id_transaction_crypto] || {};
          return {
            id,
            id_cryptomonnaie: entry.id_cryptomonnaie || "Inconnu",
            nom_cryptomonnaie: cryptomonnaies[entry.id_cryptomonnaie] || "Inconnu",  // Affichage du nom de la cryptomonnaie
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

    // Récupérer l'historique de l'individu
    onValue(historiqueRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const historiqueList: HistoriqueIndividuData[] = Object.entries(data).map(([id, entry]: [string, any]) => ({
          id_historique: id,
          date_historique: entry.date_historique,
          id_transaction_crypto_result: entry.id_transaction_crypto_result,
          id_transaction_crypto_init: entry.id_transaction_crypto_init,
          id_transaction_monnaie: entry.id_transaction_monnaie,
          id_transaction_monnaie1: entry.id_transaction_monnaie,
          id_utilisateur: entry.id_utilisateur,
        }));
        setHistoriqueIndividu(historiqueList);
      } else {
        setHistoriqueIndividu([]);
      }
      setLoading(false);
    });

    return () => {
      off(portefeuilleRef);
      off(transactionRef);
      off(cryptomonnaieRef);
    };
  }, [transactions, cryptomonnaies]);

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
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>Mon Portefeuille 💼</Text>
  
      {portefeuille.length > 0 ? (
        <FlatList
          data={portefeuille}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={{ paddingVertical: 10, paddingBottom : 10, borderBottomWidth: 1, borderBottomColor: "#ddd" }}>
              <Text style={{ fontWeight: "bold", fontSize : 18, marginBottom: 4 }}>Nom du crypto : {item.nom_cryptomonnaie}</Text>
              <Text style={{ marginBottom: 4 }}>Valeur : {item.valeur} MGA</Text>
              <Text style={{ marginBottom: 4 }}>Numero de la transaction : {item.id_trans_crypto}</Text>
              <Text style={{ marginBottom: 4 }}>Valeur de la transaction : {item.valeurTransaction} unités</Text>
              <Text style={{ marginBottom: 4 }}>Statut : {item.transactionStatus}</Text>
            </View>
          )}
        />
      ) : (
        <Text style={{ marginTop: 20 }}>Aucune cryptomonnaie dans le portefeuille.</Text>
      )}

      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 14, marginTop : 14 }}>Historique des Transactions 📜</Text>

      <FlatList
        data={historiqueIndividu}
        keyExtractor={(item) => item.id_historique}
        renderItem={({ item }) => {
          // Récupérer la transaction associée à id_transaction_crypto_result
          const transactionResult = transactions[item.id_transaction_crypto_result];
          const nomCryptomonnaie = cryptomonnaies[transactionResult?.id_cryptomonnaie1] || "Inconnu";
          const statut = transactionResult?.is_entree ? "Validé" : "Non validé";
          return (
            <View style={{ paddingVertical: 2, borderBottomWidth: 1, borderBottomColor: "#ddd" }}>
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>Date: {date}</Text>
              <Text style={{ marginBottom: 4 }}>Heure: {time.replace("Z", "")}</Text>
              <Text>ID de la transaction : {item.id_transaction_crypto_result}</Text>
              <Text>Valeur de la Transaction : {transactionResult?.valeur || 0} MGA</Text>
              <Text>Cryptomonnaie : {nomCryptomonnaie}</Text>
              <Text>Statut : {statut}</Text>
            </View>
          );
        }}
      />
    </View>
    
  );
  
};

export default Portefeuille;
