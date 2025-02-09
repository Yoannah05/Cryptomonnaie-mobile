import { useEffect, useState } from "react";
import { db } from "@/config/firebase";
<<<<<<< Updated upstream
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
=======
import { ref, onValue, off } from "firebase/database"; 
>>>>>>> Stashed changes
import { View, Text, ActivityIndicator, FlatList } from "react-native";

// Types
type PortefeuilleData = {
  id: string;
  valeur: number;
  id_cryptomonnaie: string;
  nom_cryptomonnaie?: string;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
<<<<<<< Updated upstream
    const fetchData = async () => {
      try {
        console.log("Début récupération du portefeuille...");
        const portefeuilleSnapshot = await getDocs(collection(db, "portefeuille"));

        if (portefeuilleSnapshot.empty) {
          console.warn("Aucun document trouvé dans la collection 'portefeuille'.");
          setPortefeuille([]);
          setLoading(false);
          return;
        }

        const portefeuilleData: PortefeuilleData[] = [];

        for (let docSnap of portefeuilleSnapshot.docs) {
          const portefeuille = docSnap.data();
          console.log("Données récupérées d'un document portefeuille :", portefeuille);
        
          if (!portefeuille.id_cryptomonnaie) {
            console.warn(`Référence manquante pour id_cryptomonnaie dans le portefeuille ID: ${docSnap.id}`);
            continue;
          }
        
          // Prendre seulement l'ID du document
          const cryptoId = portefeuille.id_cryptomonnaie.id;
          console.log(`ID extrait pour la cryptomonnaie: ${cryptoId}`);
        
          const cryptoDocRef = doc(db, "cryptomonnaie", cryptoId);
          
          try {
            const cryptoSnap = await getDoc(cryptoDocRef);
        
            if (!cryptoSnap.exists()) {
              console.warn(`Cryptomonnaie introuvable pour l'ID: ${cryptoId}`);
              continue;
            }
        
            const cryptoData = cryptoSnap.data() as CryptoData;
            console.log("Données récupérées pour la cryptomonnaie :", cryptoData);
        
            portefeuilleData.push({
              id: docSnap.id,
              nom_cryptomonnaie: cryptoData?.nom || "Inconnu",
              valeur_actuelle: cryptoData?.valeur_actuelle || 0,
              valeur: portefeuille.valeur_actuelle || 0,
            });
          } catch (error) {
            console.error(`Erreur lors de la récupération de la cryptomonnaie pour ${cryptoId} :`, error);
          }
        }
        
        

        setPortefeuille(portefeuilleData);
      } catch (error) {
        console.error("Erreur lors de la récupération du portefeuille :", error);
      } finally {
        setLoading(false);
=======
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
>>>>>>> Stashed changes
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
      <Text style={{ fontSize: 30, fontWeight: "bold", marginBottom: 10 }}>💼 Mon Portefeuille</Text>
  
      {portefeuille.length > 0 ? (
        <FlatList
          data={portefeuille}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={{ paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: "#ddd" }}>
              <Text style={{ fontWeight: "bold", fontSize: 18 }}>{item.nom_cryptomonnaie}</Text>
              <Text>Valeur : {item.valeur} unités</Text>
              <Text>Transaction numéro : {item.id_trans_crypto}</Text>
              <Text>Valeur de la transaction : {item.valeurTransaction} unités</Text>
              <Text>Statut : {item.transactionStatus}</Text>
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
