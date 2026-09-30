import { ThemeColors } from "@/constants/colors";
import { NoCurrentAlbumBanner, useCurrentAlbumQuery } from "@/features/albums";
import { NextEventCard, useUpcomingEventsQuery } from "@/features/calendar";
import { ImageCarousel, MediaItem, Title } from "@/features/common";
import { CounterCards } from "@/features/common/components/ui/counter-cards/CounterCards";
import { NoCoupleBanner, useCoupleQuery } from "@/features/couple";
import { HomeSkeleton } from "@/features/home";
import { useAlbumImagesInfiniteQuery } from "@/features/images";
import { useThemeColors } from "@/features/theme";
import React, { useRef, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";

export default function HomeScreen() {
  const { data: couple, isLoading: isLoadingCouple, refetch: refetchCouple } = useCoupleQuery();
  const {
    data: currentAlbum,
    isLoading: isLoadingCurrentAlbum,
    refetch: refetchCurrentAlbum,
  } = useCurrentAlbumQuery();
  // Same cache entry as the album screen's unfiltered list: opening the current album
  // from here (or coming back) reuses the pages instead of fetching them twice.
  const {
    data: imagesData,
    refetch: refetchImages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAlbumImagesInfiniteQuery(currentAlbum?.id, "all");
  const { refetch: refetchUpcomingEvents } = useUpcomingEventsQuery(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Ids already retried once — bounds retries to one refetch per image (not one for the
  // whole screen) so a fresh failure later on can still recover, without looping forever
  // on an image that's genuinely broken.
  const retriedImageIdsRef = useRef<Set<string>>(new Set());
  const colors = useThemeColors();
  const styles = createStyles(colors);

  const images =
    imagesData?.pages.flatMap((page) =>
      page.data.map((image) => ({ id: image.id, url: image.url })),
    ) ?? [];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    retriedImageIdsRef.current = new Set();
    await Promise.all([
      refetchCouple(),
      refetchCurrentAlbum(),
      refetchImages(),
      refetchUpcomingEvents(),
    ]);
    setIsRefreshing(false);
  };

  const handleImageError = (item: MediaItem) => {
    if (retriedImageIdsRef.current.has(item.id)) return;
    retriedImageIdsRef.current.add(item.id);
    refetchImages();
  };

  const handleReachEnd = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  if (isLoadingCouple) {
    return (
      <View style={styles.container}>
        <HomeSkeleton />
      </View>
    );
  }

  if (!couple || !couple.user2) {
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
        <ImageCarousel
          data={images}
          onImageError={handleImageError}
          onReachEnd={handleReachEnd}
        />
      ) : (
        <NoCurrentAlbumBanner />
      )}
      <Title style={styles.title}>
        {couple.user1.name.charAt(0).toUpperCase()} & {couple.user2?.name.charAt(0).toUpperCase()}
      </Title>
      <CounterCards initDate={couple.startDate} />
      <NextEventCard />
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
