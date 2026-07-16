import { ThemeColors } from "@/constants/colors";
import { AlbumForm, AlbumFormSkeleton, albumKeys, getAlbum, updateAlbum } from "@/features/albums";
import { useThemeColors } from "@/features/theme";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function EditAlbumScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const colors = useThemeColors();
  const styles = createStyles(colors);

  const { data: album, isLoading, isError } = useQuery({
    queryKey: albumKeys.detail(id),
    queryFn: () => getAlbum(id),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (formData: FormData) => updateAlbum(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: albumKeys.list() });
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(id) });
      router.back();
    },
    meta: { suppressErrorToast: true },
  });

  if (isLoading) {
    return <AlbumFormSkeleton />;
  }

  if (isError || !album) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Álbum no encontrado</Text>
      </View>
    );
  }

  return (
    <AlbumForm
      submitLabel="Guardar cambios"
      initialValues={{ name: album.name, coverImage: album.coverImage, isPrivate: album.isPrivate }}
      onSubmit={(formData) => mutation.mutate(formData)}
      isSubmitting={mutation.isPending}
      error={mutation.error?.message ?? null}
    />
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
    notFoundText: { fontSize: 16, color: colors.NEUTRAL[800] },
  });
