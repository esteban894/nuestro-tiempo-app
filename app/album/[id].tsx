import { colors } from "@/constants/colors";
import {
  AlbumFab,
  AlbumHeader,
  AlbumImagePickerSheet,
  AlbumMeatballsMenu,
  mockAlbums,
} from "@/features/albums";
import { ImageCarousel, OverflowMenu } from "@/features/common";
import * as ImagePicker from "expo-image-picker";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function AlbumDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const album = mockAlbums.find((item) => item.id === id);

  const [images, setImages] = useState(album?.images ?? []);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [, refresh] = useState(0);

  useFocusEffect(
    useCallback(() => {
      refresh((tick) => tick + 1);
    }, [])
  );

  if (!album) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Álbum no encontrado</Text>
      </View>
    );
  }

  const handleEdit = () => router.push({ pathname: "/album/[id]/edit", params: { id } });

  const handleMarkAsCurrent = () => {};

  const handleDeleteImage = (index: number) => {
    album.images.splice(index, 1);
    setImages([...album.images]);
  };

  const addImage = (uri: string) => {
    album.images.push(uri);
    setImages([...album.images]);
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

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerTitle: album.title,
          headerRight: () => (
            <AlbumMeatballsMenu onEdit={handleEdit} onMarkAsCurrent={handleMarkAsCurrent} />
          ),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <AlbumHeader title={album.title} isPrivate={album.isPrivate} />
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
      <AlbumFab icon="camera-outline" onPress={() => setPickerVisible(true)} style={styles.fab} />
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
