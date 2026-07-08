import { useCurrentAlbumQuery } from "@/features/albums";
import { ImageCarousel, Title } from "@/features/common";
import { CounterCards } from "@/features/common/components/ui/counter-cards/CounterCards";
import { useCoupleStore } from "@/features/couple";
import { useAlbumImagesQuery } from "@/features/images";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";

export default function HomeScreen() {
  const couple = useCoupleStore((state) => state.couple);
  const { data: currentAlbum } = useCurrentAlbumQuery();
  const { data: imagesData } = useAlbumImagesQuery(currentAlbum?.id);

  const images = imagesData?.data.map((image) => image.url) ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <ImageCarousel data={images} />
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
