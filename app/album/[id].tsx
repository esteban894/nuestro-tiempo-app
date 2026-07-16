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
import { ImageGrid, OverflowMenu } from "@/features/common";
import {
  ImageFilePart,
  useAlbumImagesInfiniteQuery,
  useDeleteImageMutation,
  useUploadImagesMutation,
} from "@/features/images";
import { useThemeColors } from "@/features/theme";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

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
  const images = albumImages.map((image) => image.url);
  const imageGridColumns = images.length > 100 ? 3 : undefined;

  const uploadImagesMutation = useUploadImagesMutation();
  const deleteImageMutation = useDeleteImageMutation();
  const deleteAlbumMutation = useDeleteAlbumMutation();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [uploadCount, setUploadCount] = useState<number | null>(null);

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
    const image = albumImages[index];
    if (!image) return;
    deleteImageMutation.mutate({ id: image.id, albumId: id });
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
      <ImageGrid
        data={images}
        numColumns={imageGridColumns}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        isFetchingNextPage={isFetchingNextPage}
        refreshing={isRefetchingImages}
        onRefresh={() => refetchImages()}
        renderOverlay={(_, index) => (
          <OverflowMenu
            triggerIcon="ellipsis-vertical"
            triggerColor="#fff"
            triggerStyle={styles.imageMenuTrigger}
            options={[
              {
                label: "Eliminar",
                icon: "trash-outline",
                destructive: true,
                onPress: () => handleDeleteImage(index),
              },
            ]}
          />
        )}
        renderExpandedOverlay={(_, index) => (
          <OverflowMenu
            triggerIcon="ellipsis-vertical"
            triggerColor="#fff"
            triggerStyle={styles.expandedImageMenuTrigger}
            options={[
              {
                label: "Eliminar",
                icon: "trash-outline",
                destructive: true,
                onPress: () => handleDeleteImage(index),
              },
            ]}
          />
        )}
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
    imageMenuTrigger: {
      position: "absolute",
      top: 10,
      right: 10,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "rgba(0,0,0,0.45)",
    },
    expandedImageMenuTrigger: {
      position: "absolute",
      top: 50,
      left: 20,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "rgba(0,0,0,0.45)",
    },
    fab: {
      position: "absolute",
      bottom: 24,
      right: 20,
    },
  });
