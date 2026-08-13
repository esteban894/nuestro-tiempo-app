import { ThemeColors } from "@/constants/colors";
import { MAX_IMAGES_PER_BATCH } from "@/constants/upload";
import {
  AlbumDetailSkeleton,
  AlbumFab,
  AlbumHeader,
  AlbumImagePickerSheet,
  AlbumMeatballsMenu,
  AlbumUploadStatus,
  albumKeys,
  getAlbum,
  setCurrentAlbum,
  useDeleteAlbumMutation,
} from "@/features/albums";
import { useAuthStore } from "@/features/auth";
import {
  ExpandedFavoriteOverlay,
  FavoriteCluster,
  FavoriterBubble,
  ImageGrid,
  MediaItem,
  OverflowMenu,
  SegmentedControl,
} from "@/features/common";
import { useCoupleQuery } from "@/features/couple";
import {
  AlbumImage,
  ImageFilePart,
  MediaLibraryPermissionError,
  useAlbumImagesInfiniteQuery,
  useDeleteImageMutation,
  useDownloadImageMutation,
  useSetImageFavoriteMutation,
  useUploadImagesMutation,
} from "@/features/images";
import { useThemeColors } from "@/features/theme";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

type FavoriteFilter = "all" | "me" | "partner" | "both";

function filterByFavorite(
  images: AlbumImage[],
  filter: FavoriteFilter,
  partnerId: string | undefined,
): AlbumImage[] {
  if (filter === "all") return images;
  const favoritedByPartner = (image: AlbumImage) =>
    !!partnerId && image.favoritedBy.some((f) => f.userId === partnerId);

  if (filter === "me") return images.filter((image) => image.favoritedByMe);
  if (filter === "partner") return images.filter(favoritedByPartner);
  return images.filter((image) => image.favoritedByMe && favoritedByPartner(image));
}

export default function AlbumDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const colors = useThemeColors();
  const styles = createStyles(colors);

  const {
    data: album,
    isLoading,
    isError,
  } = useQuery({
    queryKey: albumKeys.detail(id),
    queryFn: () => getAlbum(id),
    enabled: !!id,
  });

  const {
    data: imagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching: isRefetchingImages,
    refetch: refetchImages,
  } = useAlbumImagesInfiniteQuery(id);
  const albumImages = imagesData?.pages.flatMap((page) => page.data) ?? [];

  const currentUser = useAuthStore((state) => state.user);
  const { data: couple } = useCoupleQuery();
  const partner =
    couple && currentUser
      ? couple.user1.id === currentUser.id
        ? couple.user2
        : couple.user1
      : null;

  const [favoriteFilter, setFavoriteFilter] = useState<FavoriteFilter>("all");
  const filteredAlbumImages = filterByFavorite(albumImages, favoriteFilter, partner?.id);
  const images = filteredAlbumImages.map((image) => ({ id: image.id, url: image.url }));
  const imageGridColumns = images.length > 100 ? 3 : undefined;

  const getFavoriters = (image: AlbumImage): FavoriterBubble[] =>
    image.favoritedBy.map((favoriter) => ({
      name: favoriter.name,
      tone: favoriter.userId === currentUser?.id ? "me" : "partner",
    }));

  const uploadImagesMutation = useUploadImagesMutation();
  const deleteImageMutation = useDeleteImageMutation();
  const downloadImageMutation = useDownloadImageMutation();
  const setFavoriteMutation = useSetImageFavoriteMutation();
  const deleteAlbumMutation = useDeleteAlbumMutation();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [uploadCount, setUploadCount] = useState<number | null>(null);
  const retriedImageIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    retriedImageIdsRef.current = new Set();
  }, [id]);

  const handleImageError = (item: MediaItem) => {
    if (retriedImageIdsRef.current.has(item.id)) return;
    retriedImageIdsRef.current.add(item.id);
    refetchImages();
  };

  const handleRefreshImages = () => {
    retriedImageIdsRef.current = new Set();
    refetchImages();
  };

  const markAsCurrentMutation = useMutation({
    mutationFn: () => setCurrentAlbum(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: albumKeys.current() });
    },
  });

  const handleEdit = () => router.push({ pathname: "/album/[id]/edit", params: { id } });

  const handleMarkAsCurrent = () => markAsCurrentMutation.mutate();

  const handleDeleteAlbum = () => {
    Alert.alert(
      "Eliminar álbum",
      "Esta acción no se puede deshacer. Se eliminará el álbum y todas sus fotos.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            deleteAlbumMutation.mutate(id, { onSuccess: () => router.replace("/albums") });
          },
        },
      ],
    );
  };

  const handleDeleteImage = (index: number) => {
    const image = filteredAlbumImages[index];
    if (!image) return;
    deleteImageMutation.mutate({ id: image.id, albumId: id });
  };

  const handleToggleFavorite = (index: number) => {
    const image = filteredAlbumImages[index];
    if (!image) return;
    setFavoriteMutation.mutate({ id: image.id, favorite: !image.favoritedByMe, albumId: id });
  };

  const handleDownloadImage = (index: number) => {
    const image = filteredAlbumImages[index];
    if (!image) return;
    downloadImageMutation.mutate(
      { url: image.url, filename: image.filename },
      {
        onSuccess: () => {
          Toast.show({ type: "success", text1: "Imagen guardada en tu galería" });
        },
        onError: (error) => {
          Toast.show({
            type: "error",
            text1: "No se pudo descargar la imagen",
            text2:
              error instanceof MediaLibraryPermissionError
                ? "Activa el acceso a tus fotos en los ajustes del dispositivo."
                : undefined,
          });
        },
      },
    );
  };

  const buildImageFilePart = (uri: string): ImageFilePart => {
    const name = uri.split("/").pop() ?? "photo.jpg";
    const ext = name.split(".").pop()?.toLowerCase();
    const type = ext === "png" ? "image/png" : "image/jpeg";
    return { uri, name, type };
  };

  const handlePickImages = (uris: string[]) => {
    if (uris.length === 0) return;

    let files = uris;
    if (files.length > MAX_IMAGES_PER_BATCH) {
      files = files.slice(0, MAX_IMAGES_PER_BATCH);
      Toast.show({
        type: "info",
        text1: "Demasiadas fotos",
        text2: `Se subirán las primeras ${MAX_IMAGES_PER_BATCH} de esta selección.`,
      });
    }

    setUploadCount(files.length);
    uploadImagesMutation.mutate(
      { albumId: id, files: files.map(buildImageFilePart) },
      { onSettled: () => setUploadCount(null) },
    );
  };

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
        <Text style={styles.notFoundText}>Álbum no encontrado</Text>
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
            <Text style={styles.favoriteFilterLabelText}>Favoritas</Text>
          </View>
          <SegmentedControl
            value={favoriteFilter}
            onChange={(value) => setFavoriteFilter(value as FavoriteFilter)}
            options={[
              { label: "Todas", value: "all" },
              { label: "Mías", value: "me" },
              { label: `De ${partner.name.split(" ")[0]}`, value: "partner" },
              { label: "Nuestras", value: "both" },
            ]}
          />
        </View>
      )}
      <ImageGrid
        data={images}
        numColumns={imageGridColumns}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
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
                favoriters={getFavoriters(image)}
                onToggle={() => handleToggleFavorite(index)}
                style={styles.favoriteCluster}
              />
              <OverflowMenu
                triggerIcon="ellipsis-vertical"
                triggerColor="#fff"
                triggerStyle={styles.imageMenuTrigger}
                options={[
                  {
                    label: "Descargar",
                    icon: "download-outline",
                    onPress: () => handleDownloadImage(index),
                  },
                  {
                    label: "Eliminar",
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
                accessibilityLabel="Descargar imagen">
                <Ionicons name="download-outline" size={22} color="#fff" />
              </Pressable>
              <Pressable
                style={styles.expandedActionButton}
                onPress={() => handleDeleteImage(index)}
                accessibilityRole="button"
                accessibilityLabel="Eliminar imagen">
                <Ionicons name="trash-outline" size={22} color={colors.ERROR[500]} />
              </Pressable>
              <ExpandedFavoriteOverlay
                favoritedByMe={image.favoritedByMe}
                favoriters={getFavoriters(image)}
                onToggle={() => handleToggleFavorite(index)}
              />
            </View>
          );
        }}
      />
      <AlbumUploadStatus visible={uploadImagesMutation.isPending} count={uploadCount ?? 0} />
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
      backgroundColor: "rgba(0,0,0,0.45)",
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
      backgroundColor: "rgba(0,0,0,0.45)",
    },
    fab: {
      position: "absolute",
      bottom: 24,
      right: 20,
    },
  });
