import { ThemeColors } from "@/constants/colors";
import { Checkbox, Button, Input } from "@/features/common";
import { useThemeColors } from "@/features/theme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AlbumImagePickerSheet } from "../album-image-picker-sheet/AlbumImagePickerSheet";

interface AlbumFormInitialValues {
  name?: string;
  coverImage?: string | null;
  isPrivate?: boolean;
}

interface AlbumFormProps {
  initialValues?: AlbumFormInitialValues;
  onSubmit: (formData: FormData) => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  error?: string | null;
}

export const AlbumForm = ({
  initialValues,
  onSubmit,
  submitLabel = "Guardar",
  isSubmitting = false,
  error,
}: AlbumFormProps) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const [name, setName] = useState(initialValues?.name ?? "");
  const [coverImage, setCoverImage] = useState(initialValues?.coverImage ?? "");
  // Tracks whether `coverImage` is a freshly-picked local file (needs upload) vs.
  // the existing remote signed URL passed in via initialValues (leave untouched).
  const [isNewCoverImage, setIsNewCoverImage] = useState(false);
  const [isPrivate, setIsPrivate] = useState(initialValues?.isPrivate ?? true);
  const [pickerVisible, setPickerVisible] = useState(false);

  const handlePickCoverImage = (uris: string[]) => {
    const uri = uris[0];
    if (!uri) return;
    setCoverImage(uri);
    setIsNewCoverImage(true);
  };

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("name", name.trim());
    // Server's class-transformer accepts the string "true"/"false".
    formData.append("isPrivate", String(isPrivate));

    if (isNewCoverImage && coverImage) {
      const filename = coverImage.split("/").pop() ?? "cover.jpg";
      const ext = filename.split(".").pop()?.toLowerCase();
      const type = ext === "png" ? "image/png" : "image/jpeg";
      // React Native multipart file part shape (not a real Blob) — the cast is required.
      formData.append("coverImage", { uri: coverImage, name: filename, type } as unknown as Blob);
    }

    onSubmit(formData);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity
        style={styles.coverPicker}
        activeOpacity={0.8}
        onPress={() => setPickerVisible(true)}>
        {coverImage ? (
          <Image source={{ uri: coverImage }} style={styles.coverImage} resizeMode="cover" />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Ionicons name="image-outline" size={32} color={colors.NEUTRAL[600]} />
            <Text style={styles.coverPlaceholderLabel}>Agregar portada</Text>
          </View>
        )}
      </TouchableOpacity>

      <Input
        label="Título"
        placeholder="Título del álbum"
        value={name}
        onChangeText={setName}
      />

      <Checkbox
        checked={isPrivate}
        onChange={setIsPrivate}
        label="Álbum privado"
        style={styles.checkbox}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Button
        title={submitLabel}
        variant="primary"
        fullWidth
        isLoading={isSubmitting}
        disabled={isSubmitting}
        onPress={handleSubmit}
      />

      <AlbumImagePickerSheet
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onPickImages={handlePickCoverImage}
      />
    </ScrollView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      padding: 20,
    },
    coverPicker: {
      alignSelf: "center",
      width: 160,
      height: 160,
      borderRadius: 16,
      overflow: "hidden",
      marginBottom: 24,
    },
    coverImage: {
      width: "100%",
      height: "100%",
    },
    coverPlaceholder: {
      width: "100%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.NEUTRAL[500],
      gap: 8,
    },
    coverPlaceholderLabel: {
      fontSize: 13,
      fontWeight: "500",
      color: colors.NEUTRAL[600],
    },
    checkbox: {
      marginBottom: 24,
    },
    errorText: {
      fontSize: 13,
      color: colors.ERROR[500],
      textAlign: "center",
      marginBottom: 16,
    },
  });
