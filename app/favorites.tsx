import { ThemeColors } from "@/constants/colors";
import { AlbumDetailSkeleton } from "@/features/albums";
import { useAuthStore } from "@/features/auth";
import {
  Card,
  ExpandedFavoriteOverlay,
  FavoriteCluster,
  ImageGrid,
  MediaItem,
  SegmentedControl,
  Title,
} from "@/features/common";
import { usePartner } from "@/features/couple";
import {
  FavoritedByFilter,
  toFavoriterBubbles,
  useFavoriteImagesInfiniteQuery,
  useSetImageFavoriteMutation,
} from "@/features/images";
import { useThemeColors } from "@/features/theme";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

const EMPTY_STATE_KEYS: Record<FavoritedByFilter, { title: string; description: string }> = {
  me: { title: "favorites.emptyMe.title", description: "favorites.emptyMe.description" },
  partner: {
    title: "favorites.emptyPartner.title",
    description: "favorites.emptyPartner.description",
  },
  both: { title: "favorites.emptyBoth.title", description: "favorites.emptyBoth.description" },
};

export default function FavoritesScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = createStyles(colors);

  const currentUserId = useAuthStore((state) => state.user?.id);
  const partner = usePartner();

  const [filter, setFilter] = useState<FavoritedByFilter>("me");
  const { data, isLoading, isRefetching, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFavoriteImagesInfiniteQuery(filter);
  const setFavoriteMutation = useSetImageFavoriteMutation();

  const favoriteImages = data?.pages.flatMap((page) => page.data) ?? [];
  const totalCount = data?.pages[0]?.totalRecords ?? 0;
  const images = favoriteImages.map((image) => ({ id: image.id, url: image.url }));

  // Same one-retry-per-image pattern as the album screen, so a transient signed-URL
  // failure recovers without looping forever on a genuinely broken image.
  const retriedImageIdsRef = useRef<Set<string>>(new Set());
  const handleImageError = (item: MediaItem) => {
    if (retriedImageIdsRef.current.has(item.id)) return;
    retriedImageIdsRef.current.add(item.id);
    refetch();
  };

  const handleToggleFavorite = (index: number) => {
    const image = favoriteImages[index];
    if (!image) return;
    setFavoriteMutation.mutate({
      id: image.id,
      favorite: !image.favoritedByMe,
      albumId: image.albumId,
    });
  };

  const emptyKeys = EMPTY_STATE_KEYS[filter];

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerTitle: "" }} />
      <View style={styles.header}>
        <Title style={styles.title}>{t("favorites.title")}</Title>
        {!isLoading && (
          <Text style={styles.subtitle}>
            {totalCount === 0 ? t("favorites.noneYet") : t("favorites.count", { count: totalCount })}
          </Text>
        )}
      </View>

      {partner && (
        <SegmentedControl
          style={styles.filter}
          value={filter}
          onChange={(value) => setFilter(value as FavoritedByFilter)}
          options={[
            { label: t("favorites.filterMe"), value: "me" },
            {
              label: t("favorites.filterPartner", { name: partner.name.split(" ")[0] }),
              value: "partner",
            },
            { label: t("favorites.filterBoth"), value: "both" },
          ]}
        />
      )}

      {isLoading ? (
        <AlbumDetailSkeleton />
      ) : images.length === 0 ? (
        <Card cardStyles={styles.emptyCard}>
          <Ionicons name="heart-outline" size={40} color={colors.PRIMARY[500]} />
          <Title variant="h3" align="center" style={styles.emptyTitle}>
            {t(emptyKeys.title)}
          </Title>
          <Text style={styles.emptyDescription}>{t(emptyKeys.description)}</Text>
        </Card>
      ) : (
        <ImageGrid
          data={images}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          isFetchingNextPage={isFetchingNextPage}
          refreshing={isRefetching}
          onRefresh={() => refetch()}
          onImageError={handleImageError}
          renderOverlay={(_, index) => {
            const image = favoriteImages[index];
            if (!image) return null;
            return (
              <FavoriteCluster
                favoritedByMe={image.favoritedByMe}
                favoriters={toFavoriterBubbles(image, currentUserId)}
                onToggle={() => handleToggleFavorite(index)}
                style={styles.favoriteCluster}
              />
            );
          }}
          renderExpandedOverlay={(_, index) => {
            const image = favoriteImages[index];
            if (!image) return null;
            return (
              <View style={styles.expandedFavoriteBar}>
                <ExpandedFavoriteOverlay
                  favoritedByMe={image.favoritedByMe}
                  favoriters={toFavoriterBubbles(image, currentUserId)}
                  onToggle={() => handleToggleFavorite(index)}
                />
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.NEUTRAL[200] },
    header: { paddingHorizontal: 20, paddingTop: 12, alignItems: "center" },
    title: {
      fontFamily: "Parisienne_400Regular",
      fontWeight: "400",
      fontSize: 34,
      color: colors.PRIMARY[500],
    },
    subtitle: {
      fontSize: 14,
      color: colors.NEUTRAL[800],
      marginTop: 2,
      marginBottom: 4,
    },
    filter: { marginHorizontal: 20, marginTop: 12, marginBottom: 4 },
    emptyCard: { marginHorizontal: 20, marginTop: 20, alignItems: "center" },
    emptyTitle: { marginTop: 12, marginBottom: 8, color: colors.PRIMARY[800] },
    emptyDescription: { fontSize: 14, color: colors.NEUTRAL[800], textAlign: "center" },
    favoriteCluster: { position: "absolute", top: 10, left: 10 },
    expandedFavoriteBar: {
      position: "absolute",
      bottom: 50,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
  });
