import { colors } from "@/constants/colors";
import {
  AlbumFab,
  AlbumHeader,
  AlbumImagePickerSheet,
  AlbumMeatballsMenu,
  albumKeys,
  getAlbum,
  setCurrentAlbum,
} from "@/features/albums";
import { ImageCarousel, OverflowMenu } from "@/features/common";
import {
  ImageFilePart,
  useAlbumImagesQuery,
  useCreateImageMutation,
  useDeleteImageMutation,
} from "@/features/images";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

export default function AlbumDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: album, isLoading, isError } = useQuery({
    queryKey: albumKeys.detail(id),
    queryFn: () => getAlbum(id),
    enabled: !!id,
  });

  const { data: imagesData } = useAlbumImagesQuery(id);
  const albumImages = imagesData?.data ?? [];
  const images = albumImages.map((image) => image.url);

  const createImageMutation = useCreateImageMutation();
  const deleteImageMutation = useDeleteImageMutation();
  const [pickerVisible, setPickerVisible] = useState(false);

  const markAsCurrentMutation = useMutation({
    mutationFn: () => setCurrentAlbum(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: albumKeys.current() });
    },
  });

  const handleEdit = () => router.push({ pathname: "/album/[id]/edit", params: { id } });

  const handleMarkAsCurrent = () => markAsCurrentMutation.mutate();

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

  const addImage = (uri: string) => {
    createImageMutation.mutate({ albumId: id, file: buildImageFilePart(uri) });
  };

  const handleTakePhoto = async () => {
    setPickerVisible(false);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.8 });
    const uri = result.assets?.[0]?.uri;
    if (!result.canceled && uri) addImage(uri);
  };

  const handleChooseFromLibrary = async () => {
    setPickerVisible(false);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    const uri = result.assets?.[0]?.uri;
    if (!result.canceled && uri) addImage(uri);
  };

  if (isLoading) {
    return <ActivityIndicator style={styles.loader} color={colors.PRIMARY[500]} />;
  }

  if (isError || !album) {
    return (
      <View style={styles.notFound}>
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
              markingAsCurrent={markAsCurrentMutation.isPending}
            />
          ),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <AlbumHeader title={album.name ?? ""} isPrivate={album.isPrivate} />
        <ImageCarousel
          data={images}
          renderOverlay={(_, index) => (
            <OverflowMenu
              triggerIcon="ellipsis-vertical"
              triggerColor="#fff"
              triggerStyle={styles.imageMenuTrigger}
              options={[
                {
                  label: "Eliminar foto",
                  icon: "trash-outline",
                  destructive: true,
                  onPress: () => handleDeleteImage(index),
                },
              ]}
            />
          )}
        />
      </ScrollView>
      <AlbumFab
        icon="camera-outline"
        onPress={() => {
          if (!createImageMutation.isPending) setPickerVisible(true);
        }}
        style={styles.fab}
      />
      <AlbumImagePickerSheet
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onTakePhoto={handleTakePhoto}
        onChooseFromLibrary={handleChooseFromLibrary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, position: "relative" },
  container: { flex: 1 },
  content: { paddingBottom: 100 },
  loader: { marginTop: 40 },
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
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
  },
});
