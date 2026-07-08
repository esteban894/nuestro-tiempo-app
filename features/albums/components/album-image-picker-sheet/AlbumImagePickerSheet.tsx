import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface AlbumImagePickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onTakePhoto: () => void;
  onChooseFromLibrary: () => void;
}

export const AlbumImagePickerSheet = ({
  visible,
  onClose,
  onTakePhoto,
  onChooseFromLibrary,
}: AlbumImagePickerSheetProps) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Agregar foto</Text>

        <TouchableOpacity style={styles.option} activeOpacity={0.7} onPress={onTakePhoto}>
          <View style={styles.iconWrapper}>
            <Ionicons name="camera-outline" size={22} color={colors.PRIMARY[500]} />
          </View>
          <Text style={styles.optionLabel}>Tomar foto</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} activeOpacity={0.7} onPress={onChooseFromLibrary}>
          <View style={styles.iconWrapper}>
            <Ionicons name="images-outline" size={22} color={colors.PRIMARY[500]} />
          </View>
          <Text style={styles.optionLabel}>Elegir de la galería</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancel} activeOpacity={0.7} onPress={onClose}>
          <Text style={styles.cancelLabel}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
