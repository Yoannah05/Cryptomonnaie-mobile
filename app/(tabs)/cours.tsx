import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, Dimensions, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { db } from '@/config/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

<<<<<<< Updated upstream
import { HelloWave } from '@/components/HelloWave';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function CoursScreen() {
  const [loading, setLoading] = useState(true);
  const [variations, setVariations] = useState<VariationData[]>([]);
  const [cryptoColors, setCryptoColors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchVariations = async () => {
      try {
        console.log("Récupération des variations...");
        const variationsSnapshot = await getDocs(collection(db, "variation_cryptomonnaie"));

        if (variationsSnapshot.empty) {
          console.warn("Aucune donnée trouvée dans 'variation_cryptomonnaie'.");
          setVariations([]);
          setLoading(false);
          return;
        }

        const variationsData: VariationData[] = [];
        const cryptoSet = new Set<string>();

        for (let docSnap of variationsSnapshot.docs) {
          const variation = docSnap.data();
          console.log("Données récupérées d'une variation :", variation);

          if (!variation.id_cryptomonnaie || !variation.id_valeur) {
            console.warn(`Référence manquante dans la variation ID: ${docSnap.id}`);
            continue;
          }

          const cryptoId = variation.id_cryptomonnaie.id;
          const valeurId = variation.id_valeur.id;

          // Récupération du nom de la cryptomonnaie
          const cryptoDocRef = doc(db, "cryptomonnaie", cryptoId);
          const cryptoSnap = await getDoc(cryptoDocRef);

          if (!cryptoSnap.exists()) {
            console.warn(`Cryptomonnaie introuvable pour l'ID: ${cryptoId}`);
            continue;
          }

          const cryptoData = cryptoSnap.data();
          const cryptoName = cryptoData.nom || "Inconnu";
          cryptoSet.add(cryptoName);

          // Récupération de la valeur de la variation
          const valeurDocRef = doc(db, "variation", valeurId);
          const valeurSnap = await getDoc(valeurDocRef);

          if (!valeurSnap.exists()) {
            console.warn(`Valeur de variation introuvable pour l'ID: ${valeurId}`);
            continue;
          }

          const valeurData = valeurSnap.data();

          variationsData.push({
            id: docSnap.id,
            nom_cryptomonnaie: cryptoName,
            valeur: valeurData.valeur || 0,
            date_variation: new Date(valeurData.date_variation.seconds * 1000).toLocaleDateString(),
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
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">This is the profile screen</ThemedText>
        <ThemedText>
          this is a test <ThemedText type="defaultSemiBold">yazzz</ThemedText> right?
          Press{' '}
        </ThemedText>
      </ThemedView>
    </SafeAreaView>
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
});
=======
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
            yAxisLabel="$"
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
>>>>>>> Stashed changes
