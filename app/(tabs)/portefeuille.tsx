import { useEffect, useState } from "react";
import { db } from "@/config/firebase";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import { View, Text, ActivityIndicator, FlatList } from "react-native";

// Définition des types
type PortefeuilleData = {
  id: string;
  valeur: number;
  nom_cryptomonnaie: string;
  valeur_actuelle: number;
};

type CryptoData = {
  nom: string;
  valeur_actuelle: number;
};

const Portefeuille = () => {
  const [portefeuille, setPortefeuille] = useState<PortefeuilleData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      }
    };

    fetchData();
  }, []);

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
          contentContainerStyle={{ paddingBottom: 20 }} // Ajout d'un padding en bas pour un bon espacement
          renderItem={({ item }) => (
            <View style={{ paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: "#ddd" }}>
              <Text style={{ fontWeight: "bold" }}>{item.nom_cryptomonnaie}</Text>
              <Text>{item.valeur} unités ({item.valeur_actuelle} USD)</Text>
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
