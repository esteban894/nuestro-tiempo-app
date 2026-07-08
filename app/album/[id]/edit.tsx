import { colors } from "@/constants/colors";
import { AlbumForm, AlbumFormValues, mockAlbums } from "@/features/albums";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function EditAlbumScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const album = mockAlbums.find((item) => item.id === id);

  if (!album) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Álbum no encontrado</Text>
      </View>
    );
  }

  const handleSubmit = (values: AlbumFormValues) => {
    album.title = values.title;
    album.coverImage = values.coverImage;
    album.isPrivate = values.isPrivate;
    router.back();
  };

  return (
    <AlbumForm
      submitLabel="Guardar cambios"
      initialValues={{ title: album.title, coverImage: album.coverImage, isPrivate: album.isPrivate }}
      onSubmit={handleSubmit}
    />
  );
}

const styles = StyleSheet.create({
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFoundText: { fontSize: 16, color: colors.NEUTRAL[800] },
});
