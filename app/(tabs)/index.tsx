import { ImageCarousel, Title } from "@/features/common";
import { CounterCards } from "@/features/common/components/ui/counter-cards/CounterCards";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";

const data = [
  "https://picsum.photos/800?1",
  "https://picsum.photos/800?2",
  "https://picsum.photos/800?3",
  "https://picsum.photos/800?4",
];

const initDate = "2025-05-03T21:00:00-03:00";

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <ImageCarousel data={data} />
      <Title style={styles.title}>Nuestra Historia</Title>
      <CounterCards initDate={initDate} />
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
