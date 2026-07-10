import { ThemeColors } from "@/constants/colors";
import { useCurrentAlbumQuery } from "@/features/albums";
import { ImageCarousel, Title } from "@/features/common";
import { CounterCards } from "@/features/common/components/ui/counter-cards/CounterCards";
import { useCoupleStore } from "@/features/couple";
import { useAlbumImagesQuery } from "@/features/images";
import { useThemeColors } from "@/features/theme";
import React, { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";

export default function HomeScreen() {
  const couple = useCoupleStore((state) => state.couple);
  const fetchCouple = useCoupleStore((state) => state.fetchCouple);
  const { data: currentAlbum, refetch: refetchCurrentAlbum } = useCurrentAlbumQuery();
  const { data: imagesData, refetch: refetchImages } = useAlbumImagesQuery(currentAlbum?.id);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const colors = useThemeColors();
  const styles = createStyles(colors);

  const images = imagesData?.data.map((image) => image.url) ?? [];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchCouple(), refetchCurrentAlbum(), refetchImages()]);
    setIsRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={colors.PRIMARY[500]}
          colors={[colors.PRIMARY[500]]}
        />
      }>
      <ImageCarousel data={images} />
      <Title style={styles.title}>Juntos hace</Title>
      {couple && <CounterCards initDate={couple.startDate} />}
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.NEUTRAL[200],
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
      color: colors.PRIMARY[500],
    },
  });
