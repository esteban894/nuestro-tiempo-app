import { ThemeColors } from "@/constants/colors";
import { Button, Checkbox, Input } from "@/features/common";
import { buildImageFilePart, type PickedImage } from "@/features/images";
import { useThemeColors } from "@/features/theme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { prepareCoverImageUpload } from "../../api/album.api";
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
  submitLabel,
  isSubmitting = false,
  error,
}: AlbumFormProps) => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const [name, setName] = useState(initialValues?.name ?? "");
  const [coverImage, setCoverImage] = useState(initialValues?.coverImage ?? "");
  // Holds the freshly picked asset (never the already-uploaded initial cover), so it
  // doubles as the "needs uploading" flag and carries the picker's real mime type.
  const [newCoverAsset, setNewCoverAsset] = useState<PickedImage | null>(null);
  const [isPrivate, setIsPrivate] = useState(initialValues?.isPrivate ?? true);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const handlePickCoverImage = (assets: PickedImage[]) => {
    const asset = assets[0];
    if (!asset) return;
    setCoverImage(asset.uri);
    setNewCoverAsset(asset);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("isPrivate", String(isPrivate));

    if (newCoverAsset) {
      setIsUploadingCover(true);
      try {
        const result = await prepareCoverImageUpload(buildImageFilePart(newCoverAsset));
        if (result.kind === "key") {
          formData.append("coverImageKey", result.coverImageKey);
        } else {
          formData.append("coverImage", result.coverImage as unknown as Blob);
        }
      } finally {
        setIsUploadingCover(false);
      }
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
            <Text style={styles.coverPlaceholderLabel}>{t("albums.form.addCover")}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Input
        label={t("albums.form.titleLabel")}
        placeholder={t("albums.form.titlePlaceholder")}
        value={name}
        onChangeText={setName}
      />

      <Checkbox
        checked={isPrivate}
        onChange={setIsPrivate}
        label={t("albums.form.privateLabel")}
        style={styles.checkbox}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Button
        title={submitLabel ?? t("albums.form.defaultSubmit")}
        variant="primary"
        fullWidth
        isLoading={isSubmitting || isUploadingCover}
        disabled={isSubmitting || isUploadingCover}
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
