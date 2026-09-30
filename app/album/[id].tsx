import { ThemeColors } from "@/constants/colors";
import {
  AlbumDetailSkeleton,
  AlbumFab,
  AlbumHeader,
  AlbumImagePickerSheet,
  AlbumMeatballsMenu,
  AlbumUploadStatus,
  useAlbumDetailController,
} from "@/features/albums";
import {
  ExpandedFavoriteOverlay,
  FavoriteCluster,
  ImageGrid,
  OverflowMenu,
  SegmentedControl,
} from "@/features/common";
import { toFavoriterBubbles } from "@/features/images";
import { useThemeColors } from "@/features/theme";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function AlbumDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColors();
  const styles = createStyles(colors);

  const {
    album,
    isLoading,
    isError,
    partner,
    currentUserId,
    favoriteFilter,
    setFavoriteFilter,
    images,
    imageGridColumns,
    filteredAlbumImages,
    isFetchingNextPage,
    isRefetchingImages,
    handleFetchNextPage,
    handleImageError,
    handleRefreshImages,
    handleEdit,
    handleMarkAsCurrent,
    handleDeleteAlbum,
    handleDeleteImage,
    handleToggleFavorite,
    handleDownloadImage,
    handlePickImages,
    markAsCurrentMutation,
    deleteAlbumMutation,
    uploadImagesMutation,
    pickerVisible,
    setPickerVisible,
    uploadItems,
  } = useAlbumDetailController(id);

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerTitle: "" }} />
        <AlbumDetailSkeleton />
      </>
    );
  }

  if (isError || !album) {
    return (
      <View style={styles.notFound}>
        <Stack.Screen options={{ headerTitle: "" }} />
        <Text style={styles.notFoundText}>{t("albums.notFound")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerTitle: album.name ?? "",
          headerRight: () => (
            <AlbumMeatballsMenu
              onEdit={handleEdit}
              onMarkAsCurrent={handleMarkAsCurrent}
              onDelete={handleDeleteAlbum}
              markingAsCurrent={markAsCurrentMutation.isPending}
              deleting={deleteAlbumMutation.isPending}
            />
          ),
        }}
      />
      <AlbumHeader title={album.name ?? ""} isPrivate={album.isPrivate} />
      {partner && (
        <View style={styles.favoriteFilterSection}>
          <View style={styles.favoriteFilterLabel}>
            <Ionicons name="heart" size={12} color={colors.NEUTRAL[800]} />
            <Text style={styles.favoriteFilterLabelText}>{t("albums.favoriteFilter.label")}</Text>
          </View>
          <SegmentedControl
            value={favoriteFilter}
            onChange={(value) => setFavoriteFilter(value as typeof favoriteFilter)}
            options={[
              { label: t("albums.favoriteFilter.all"), value: "all" },
              { label: t("albums.favoriteFilter.me"), value: "me" },
              {
                label: t("albums.favoriteFilter.partner", { name: partner.name.split(" ")[0] }),
                value: "partner",
              },
              { label: t("albums.favoriteFilter.both"), value: "both" },
            ]}
          />
        </View>
      )}
      <ImageGrid
        data={images}
        numColumns={imageGridColumns}
        onEndReached={handleFetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
        refreshing={isRefetchingImages}
        onRefresh={handleRefreshImages}
        onImageError={handleImageError}
        renderOverlay={(_, index) => {
          const image = filteredAlbumImages[index];
          if (!image) return null;
          return (
            <>
              <FavoriteCluster
                favoritedByMe={image.favoritedByMe}
                favoriters={toFavoriterBubbles(image, currentUserId)}
                onToggle={() => handleToggleFavorite(index)}
                style={styles.favoriteCluster}
              />
              <OverflowMenu
                triggerIcon="ellipsis-vertical"
                triggerColor={colors.WHITE}
                triggerStyle={styles.imageMenuTrigger}
                options={[
                  {
                    label: t("albums.imageMenu.download"),
                    icon: "download-outline",
                    onPress: () => handleDownloadImage(index),
                  },
                  {
                    label: t("albums.imageMenu.delete"),
                    icon: "trash-outline",
                    destructive: true,
                    onPress: () => handleDeleteImage(index),
                  },
                ]}
              />
            </>
          );
        }}
        renderExpandedOverlay={(_, index) => {
          const image = filteredAlbumImages[index];
          if (!image) return null;
          return (
            <View style={styles.expandedActionBar}>
              <Pressable
                style={styles.expandedActionButton}
                onPress={() => handleDownloadImage(index)}
                accessibilityRole="button"
                accessibilityLabel={t("albums.imageMenu.downloadA11y")}>
                <Ionicons name="download-outline" size={22} color={colors.WHITE} />
              </Pressable>
              <Pressable
                style={styles.expandedActionButton}
                onPress={() => handleDeleteImage(index)}
                accessibilityRole="button"
                accessibilityLabel={t("albums.imageMenu.deleteA11y")}>
                <Ionicons name="trash-outline" size={22} color={colors.ERROR[500]} />
              </Pressable>
              <ExpandedFavoriteOverlay
                favoritedByMe={image.favoritedByMe}
                favoriters={toFavoriterBubbles(image, currentUserId)}
                onToggle={() => handleToggleFavorite(index)}
              />
            </View>
          );
        }}
      />
      <AlbumUploadStatus items={uploadImagesMutation.isPending ? uploadItems : undefined} />
      <AlbumFab
        icon="camera-outline"
        onPress={() => {
          if (!uploadImagesMutation.isPending) setPickerVisible(true);
        }}
        style={styles.fab}
      />
      <AlbumImagePickerSheet
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onPickImages={handlePickImages}
        allowsMultipleSelection
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1, position: "relative", backgroundColor: colors.NEUTRAL[200] },
    notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
    notFoundText: { fontSize: 16, color: colors.NEUTRAL[800] },
    favoriteFilterSection: {
      marginHorizontal: 20,
      marginBottom: 12,
      gap: 6,
    },
    favoriteFilterLabel: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    favoriteFilterLabelText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.NEUTRAL[800],
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    favoriteCluster: {
      position: "absolute",
      top: 10,
      left: 10,
    },
    imageMenuTrigger: {
      position: "absolute",
      top: 10,
      right: 10,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.OVERLAY,
    },
    expandedActionBar: {
      position: "absolute",
      bottom: 50,
      left: 0,
      right: 0,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      paddingHorizontal: 40,
    },
    expandedActionButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.OVERLAY,
    },
    fab: {
      position: "absolute",
      bottom: 24,
      right: 20,
    },
  });
