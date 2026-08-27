import { ThemeColors } from "@/constants/colors";
import { MAX_IMAGES_PER_BATCH } from "@/constants/upload";
import type { PickedImage } from "@/features/images";
import { useThemeColors } from "@/features/theme";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

/** Keeps the picker's own `mimeType` alongside the uri — it's the only reliable read of
 *  what the asset actually is, and the presigned upload path needs an honest type. */
function toPickedImage(asset: ImagePicker.ImagePickerAsset): PickedImage {
  return { uri: asset.uri, fileName: asset.fileName, mimeType: asset.mimeType };
}

interface AlbumImagePickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onPickImages: (assets: PickedImage[]) => void;
  allowsMultipleSelection?: boolean;
}

export const AlbumImagePickerSheet = ({
  visible,
  onClose,
  onPickImages,
  allowsMultipleSelection = false,
}: AlbumImagePickerSheetProps) => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = createStyles(colors);

  const handleTakePhoto = async () => {
    onClose();
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.8 });
    const asset = result.assets?.[0];
    if (!result.canceled && asset) onPickImages([toPickedImage(asset)]);
  };

  const handleChooseFromLibrary = async () => {
    onClose();
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsMultipleSelection,
      selectionLimit: allowsMultipleSelection ? MAX_IMAGES_PER_BATCH : 1,
    });
    const assets = result.assets?.map(toPickedImage) ?? [];
    if (!result.canceled && assets.length > 0) onPickImages(assets);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>{t("albums.imagePicker.title")}</Text>

        <TouchableOpacity style={styles.option} activeOpacity={0.7} onPress={handleTakePhoto}>
          <View style={styles.iconWrapper}>
            <Ionicons name="camera-outline" size={22} color={colors.PRIMARY[500]} />
          </View>
          <Text style={styles.optionLabel}>{t("albums.imagePicker.takePhoto")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          activeOpacity={0.7}
          onPress={handleChooseFromLibrary}>
          <View style={styles.iconWrapper}>
            <Ionicons name="images-outline" size={22} color={colors.PRIMARY[500]} />
          </View>
          <Text style={styles.optionLabel}>{t("albums.imagePicker.chooseFromLibrary")}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancel} activeOpacity={0.7} onPress={onClose}>
          <Text style={styles.cancelLabel}>{t("albums.imagePicker.cancel")}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    sheet: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.NEUTRAL[200],
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 32,
    },
    handle: {
      alignSelf: "center",
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.NEUTRAL[600],
      marginBottom: 16,
    },
    title: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.NEUTRAL[800],
      marginBottom: 8,
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
    },
    iconWrapper: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.NEUTRAL[500],
      marginRight: 14,
    },
    optionLabel: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.NEUTRAL[800],
    },
    cancel: {
      marginTop: 8,
      paddingVertical: 14,
      alignItems: "center",
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.NEUTRAL[600],
    },
    cancelLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.PRIMARY[500],
    },
  });
