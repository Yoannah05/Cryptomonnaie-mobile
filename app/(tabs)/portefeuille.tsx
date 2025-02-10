import { useEffect, useState, useContext } from "react";
import { db } from "@/config/firebase";
import { ref, onValue, off } from "firebase/database";
import { View, Text, ActivityIndicator, FlatList } from "react-native";
import { UserDetailContext } from "@/context/userDetailContext"; // Importer le contexte utilisateur
import FirebaseService from "@/app/services/firebaseService";  // Assurez-vous que FirebaseService est bien importé

// Types
type PortefeuilleData = {
  id: string;
  valeur: number;
  id_cryptomonnaie: string;
  nom_cryptomonnaie?: string;  // Nom de la cryptomonnaie
  id_trans_crypto?: string;
  valeurTransaction?: number;
  transactionStatus?: string;
  id_utilisateur?: string;
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

const Portefeuille = () => {
  const [portefeuille, setPortefeuille] = useState<PortefeuilleData[]>([]);
  const [transactions, setTransactions] = useState<Record<string, TransactionData>>({});
  const [cryptomonnaies, setCryptomonnaies] = useState<Record<string, string>>({});
  const [historiqueIndividu, setHistoriqueIndividu] = useState<HistoriqueIndividuData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);  // Pour stocker l'ID de l'utilisateur

  useEffect(() => {
    // Assurez-vous que l'utilisateur est connecté
    const user = FirebaseService.getCurrentUser(); // Récupérer l'utilisateur actuel (ajustez selon votre implémentation)
    if (user) {
      setUserId(user.uid);
      // Récupérer les données de l'utilisateur depuis Firebase
      FirebaseService.getUserData(user.uid).then((userData) => {
      }).catch((error) => {
        console.error("Erreur lors de la récupération des données utilisateur:", error);
      });

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
                id_cryptomonnaie1: entry.id_cryptomonnaie,
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
              id_utilisateur: entry.id_utilisateur,  // Récupérer l'id_utilisateur depuis la base de données
              id_cryptomonnaie: entry.id_cryptomonnaie || "Inconnu",
              nom_cryptomonnaie: cryptomonnaies[entry.id_cryptomonnaie] || "Inconnu",
              valeur: entry.valeur_actuelle || 0,
              id_trans_crypto: entry.id_transaction_crypto || "N/A",
              valeurTransaction: transaction.valeur || 0,
              transactionStatus: transaction.is_entree ? "Validé" : "Non validé",
            };
          }).filter(item => item.id_utilisateur === user.uid);  // Comparer avec id_utilisateur
          setPortefeuille(portefeuilleList);
        } else {
          setPortefeuille([]);
        }
        setLoading(false);
      });

      // Récupérer l'historique de l'individu et filtrer par id_utilisateur
      onValue(historiqueRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const historiqueList: HistoriqueIndividuData[] = Object.entries(data).map(([id, entry]: [string, any]) => ({
            id_historique: id,
            date_historique: entry.date_historique,
            id_transaction_crypto_result: entry.id_transaction_crypto_result,
            id_transaction_crypto_init: entry.id_transaction_crypto_init,
            id_transaction_monnaie: entry.id_transaction_monnaie,
            id_utilisateur: entry.id_utilisateur,
          })).filter(item => item.id_utilisateur === user.uid);  // Comparer avec id_utilisateur
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
        off(historiqueRef);
      };
    } else {
      setLoading(false);
      console.log("Aucun utilisateur connecté.");
    }
  }, [transactions, cryptomonnaies]);
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

    // Récupérer le portefeuille
    onValue(portefeuilleRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const portefeuilleList: PortefeuilleData[] = Object.entries(data).map(([id, entry]: [string, any]) => {
          const transaction = transactions[entry.id_transaction_crypto] || {};
          return {
            id,
            id_cryptomonnaie: entry.id_cryptomonnaie || "Inconnu",
            nom_cryptomonnaie: entry.nom || "Inconnu",
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
    };
  }, [transactions]);

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
            <View style={{ paddingVertical: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "#ddd" }}>
              <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 4 }}>Nom du crypto : {item.nom_cryptomonnaie}</Text>
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

      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 14, marginTop: 14 }}>Historique des Transactions 📜</Text>

      <FlatList
        data={historiqueIndividu}
        keyExtractor={(item) => item.id_historique}
        renderItem={({ item }) => {
          const transactionResult = transactions[item.id_transaction_crypto_result];
          const nomCryptomonnaie = cryptomonnaies[transactionResult?.id_cryptomonnaie1] || "Inconnu";
          const statut = transactionResult?.is_entree ? "Validé" : "Non validé";
          return (
            <View style={{ paddingVertical: 2, borderBottomWidth: 1, borderBottomColor: "#ddd" }}>
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>Date: {item.date_historique}</Text>
              <Text style={{ marginBottom: 4 }}>Transaction : {item.id_transaction_crypto_result}</Text>
              <Text>Valeur : {transactionResult?.valeur || 0} MGA</Text>
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
