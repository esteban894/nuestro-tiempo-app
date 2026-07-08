import { ImageCarousel, Title } from "@/features/common";
import { CounterCards } from "@/features/common/components/ui/counter-cards/CounterCards";
import { useCoupleStore } from "@/features/couple";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";

const data = [
  "https://picsum.photos/800?1",
  "https://picsum.photos/800?2",
  "https://picsum.photos/800?3",
  "https://picsum.photos/800?4",
];

export default function HomeScreen() {
  const couple = useCoupleStore((state) => state.couple);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <ImageCarousel data={data} />
      <Title style={styles.title}>Nuestra Historia</Title>
      {couple && <CounterCards initDate={couple.startDate} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 20,
  },
  title: {
    marginVertical: 20,
    textAlign: "center",
    fontFamily: "PlaywriteAUQLD_400Regular",
    fontWeight: "400",
    textDecorationLine: "underline",
    color: "#fa0000",
  },
});
