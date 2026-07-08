import { colors } from "@/constants/colors";
import { Checkbox, Button, Input } from "@/features/common";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AlbumImagePickerSheet } from "../album-image-picker-sheet/AlbumImagePickerSheet";

export interface AlbumFormValues {
  title: string;
  coverImage: string;
  isPrivate: boolean;
}

interface AlbumFormProps {
  initialValues?: Partial<AlbumFormValues>;
  onSubmit: (values: AlbumFormValues) => void;
  submitLabel?: string;
}

export const AlbumForm = ({ initialValues, onSubmit, submitLabel = "Guardar" }: AlbumFormProps) => {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [coverImage, setCoverImage] = useState(initialValues?.coverImage ?? "");
  const [isPrivate, setIsPrivate] = useState(initialValues?.isPrivate ?? true);
  const [pickerVisible, setPickerVisible] = useState(false);

  const handleTakePhoto = async () => {
    setPickerVisible(false);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.8 });
    const uri = result.assets?.[0]?.uri;
    if (!result.canceled && uri) setCoverImage(uri);
  };

  const handleChooseFromLibrary = async () => {
    setPickerVisible(false);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
    const uri = result.assets?.[0]?.uri;
    if (!result.canceled && uri) setCoverImage(uri);
  };

  const handleSubmit = () => {
    onSubmit({ title: title.trim(), coverImage, isPrivate });
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
        value={title}
        onChangeText={setTitle}
      />

      <Checkbox
        checked={isPrivate}
        onChange={setIsPrivate}
        label="Álbum privado"
        style={styles.checkbox}
      />

      <Button title={submitLabel} variant="primary" fullWidth onPress={handleSubmit} />

      <AlbumImagePickerSheet
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onTakePhoto={handleTakePhoto}
        onChooseFromLibrary={handleChooseFromLibrary}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
});
