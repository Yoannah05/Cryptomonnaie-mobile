import { useEffect, useState } from "react";
import { db } from "@/config/firebase";
import { ref, get, child } from "firebase/database"; // Import des fonctions Realtime Database
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

        // Récupérer les données du portefeuille
        const portefeuilleRef = ref(db, "portefeuille");
        const portefeuilleSnapshot = await get(portefeuilleRef);

        if (!portefeuilleSnapshot.exists()) {
          console.warn("Aucune donnée trouvée dans 'portefeuille'.");
          setPortefeuille([]);
          setLoading(false);
          return;
        }

        const portefeuilleData: PortefeuilleData[] = [];
        const portefeuilleObject = portefeuilleSnapshot.val();

        // Parcourir les entrées du portefeuille
        for (const [id, portefeuille] of Object.entries(portefeuilleObject)) {
          const portefeuilleEntry = portefeuille as any;
          console.log("Données récupérées d'une entrée portefeuille :", portefeuilleEntry);

          if (!portefeuilleEntry.id_cryptomonnaie) {
            console.warn(`Référence manquante pour id_cryptomonnaie dans le portefeuille ID: ${id}`);
            continue;
          }

          // Récupérer les données de la cryptomonnaie
          const cryptoId = portefeuilleEntry.id_cryptomonnaie;
          const cryptoRef = ref(db, `cryptomonnaie/${cryptoId}`);
          const cryptoSapshot = await get(cryptoRef);

          if (!cryptoSapshot.exists()) {
            console.warn(`Cryptomonnaie introuvable pour l'ID: ${cryptoId}`);
            continue;
          }

          const cryptoData = cryptoSapshot.val() as CryptoData;
          console.log("Données récupérées pour la cryptomonnaie :", cryptoData);

          portefeuilleData.push({
            id: id,
            nom_cryptomonnaie: cryptoData?.nom || "Inconnu",
            valeur_actuelle: cryptoData?.valeur_actuelle || 0,
            valeur: portefeuilleEntry.valeur || 0,
          });
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