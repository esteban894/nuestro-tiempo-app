import { ThemeColors } from "@/constants/colors";
import { NoCurrentAlbumBanner, useCurrentAlbumQuery } from "@/features/albums";
import { ImageCarousel, Title } from "@/features/common";
import { CounterCards } from "@/features/common/components/ui/counter-cards/CounterCards";
import { NoCoupleBanner, useCoupleStore } from "@/features/couple";
import { useAlbumImagesQuery } from "@/features/images";
import { useThemeColors } from "@/features/theme";
import React, { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";

export default function HomeScreen() {
  const couple = useCoupleStore((state) => state.couple);
  const fetchCouple = useCoupleStore((state) => state.fetchCouple);
  const {
    data: currentAlbum,
    isLoading: isLoadingCurrentAlbum,
    refetch: refetchCurrentAlbum,
  } = useCurrentAlbumQuery();
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

  if (!couple) {
    return (
      <View style={[styles.container, styles.contentContainer, styles.emptyContainer]}>
        <NoCoupleBanner />
      </View>
    );
  }

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
      {currentAlbum || isLoadingCurrentAlbum ? (
        <ImageCarousel data={images} />
      ) : (
        <NoCurrentAlbumBanner />
      )}
      <Title style={styles.title}>
        {couple.user1.name.charAt(0).toUpperCase()} & {couple.user1.name.charAt(0).toUpperCase()}
      </Title>
      <CounterCards initDate={couple.startDate} />
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
    emptyContainer: {
      justifyContent: "center",
    },
    title: {
      marginVertical: 20,
      textAlign: "center",
      fontFamily: "Parisienne_400Regular",
      fontWeight: "400",
      color: colors.PRIMARY[500],
    },
  });
