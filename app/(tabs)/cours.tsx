import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, Dimensions, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { db } from '@/config/firebase';
import { ref, onValue, get } from 'firebase/database'; // Utilisation de onValue pour les mises à jour en temps réel

const screenWidth = Dimensions.get('window').width;

// Fonction pour générer une couleur unique pour chaque cryptomonnaie
const generateColor = (index: number) => {
  const colors = ["#FF5733", "#33FF57", "#3357FF", "#F4A460", "#800080", "#FFD700", "#FF69B4"];
  return colors[index % colors.length];
};

type VariationData = {
  id: string;
  valeur: number;
  date_variation: string;
  nom_cryptomonnaie: string;
};

export default function CoursScreen() {
  const [loading, setLoading] = useState(true);
  const [variations, setVariations] = useState<VariationData[]>([]);
  const [cryptoColors, setCryptoColors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchVariations = () => {
      const variationsRef = ref(db, 'variation_cryptomonnaie');
      
      // Écoute les changements dans les données de variation
      const unsubscribe = onValue(variationsRef, async (snapshot) => {
        console.log("Récupération des données...");

        try {
          if (!snapshot.exists()) {
            console.warn("Aucune donnée trouvée dans 'variation_cryptomonnaie'.");
            setVariations([]);
            setLoading(false);
            return;
          }

          const variationsData: VariationData[] = [];
          const cryptoSet = new Set<string>();
          const variationsObject = snapshot.val();

          // Parcourir les variations
          for (const [id, variation] of Object.entries(variationsObject)) {
            const variationEntry = variation as any;

            if (!variationEntry.id_cryptomonnaie || !variationEntry.id_valeur) {
              console.warn(`Référence manquante dans la variation ID: ${id}`);
              continue;
            }

            // Récupérer le nom de la cryptomonnaie
            const cryptoId = variationEntry.id_cryptomonnaie;
            const cryptoRef = ref(db, `cryptomonnaie/${cryptoId}`);
            const cryptoSnapshot = await get(cryptoRef);

            if (!cryptoSnapshot.exists()) {
              console.warn(`Cryptomonnaie introuvable pour l'ID: ${cryptoId}`);
              continue;
            }

            const cryptoData = cryptoSnapshot.val();
            const cryptoName = cryptoData.nom || "Inconnu";
            cryptoSet.add(cryptoName);

            // Récupérer la valeur de la variation
            const valeurId = variationEntry.id_valeur;
            const valeurRef = ref(db, `variation/${valeurId}`);
            const valeurSnapshot = await get(valeurRef);

            if (!valeurSnapshot.exists()) {
              console.warn(`Valeur de variation introuvable pour l'ID: ${valeurId}`);
              continue;
            }

            const valeurData = valeurSnapshot.val();

            variationsData.push({
              id: id,
              nom_cryptomonnaie: cryptoName,
              valeur: valeurData.valeur || 0,
              date_variation: new Date(valeurData.date_variation).toLocaleDateString(),
            });
          }

          // Générer une couleur pour chaque cryptomonnaie
          const cryptoColorMap: { [key: string]: string } = {};
          Array.from(cryptoSet).forEach((crypto, index) => {
            cryptoColorMap[crypto] = generateColor(index);
          });

          setCryptoColors(cryptoColorMap);
          setVariations(variationsData);
        } catch (error) {
          console.error("Erreur lors de la récupération des variations :", error);
        } finally {
          setLoading(false);
        }
      });

      // Annuler l'abonnement lorsque le composant est démonté
      return () => unsubscribe();
    };

    fetchVariations();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Chargement des variations...</Text>
      </View>
    );
  }

  // Organiser les variations par cryptomonnaie
  const groupedVariations: { [key: string]: VariationData[] } = {};
  variations.forEach(variation => {
    if (!groupedVariations[variation.nom_cryptomonnaie]) {
      groupedVariations[variation.nom_cryptomonnaie] = [];
    }
    groupedVariations[variation.nom_cryptomonnaie].push(variation);
  });

  return (
    <SafeAreaView style={{ flex: 1, padding: 20, paddingTop: 40 }}>
      <Text style={{ fontSize: 25, fontWeight: "bold", marginBottom: 50 }}>📈 Historique des variations</Text>

      {variations.length > 0 ? (
        <>
          <LineChart
            data={{
              labels: variations.map(v => v.date_variation),
              datasets: Object.keys(groupedVariations).map((crypto, index) => ({
                data: groupedVariations[crypto].map(v => v.valeur),
                color: () => cryptoColors[crypto] || "#000", // Couleur assignée à la cryptomonnaie
              })),
            }}
            width={screenWidth - 40}
            height={250}
            yAxisLabel="Ar "
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#f7f7f7",
              backgroundGradientTo: "#e0e0e0",
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: { r: "6", strokeWidth: "2", stroke: "#000" },
            }}
            style={{ marginVertical: 10, borderRadius: 16 }}
          />

          {/* Légende */}
          <View style={{ marginTop: 50 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>Légende :</Text>
            {Object.keys(cryptoColors).map(crypto => (
              <View key={crypto} style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}>
                <View
                  style={{
                    width: 20,
                    height: 20,
                    backgroundColor: cryptoColors[crypto],
                    marginRight: 10,
                    borderRadius: 5,
                  }}
                />
                <Text>{crypto}</Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        <Text>Aucune donnée de variation disponible.</Text>
      )}
    </SafeAreaView>
  );
}
