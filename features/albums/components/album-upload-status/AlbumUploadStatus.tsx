import { ThemeColors } from "@/constants/colors";
import { useThemeColors } from "@/features/theme";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

interface AlbumUploadStatusProps {
  visible: boolean;
  count: number;
}

export const AlbumUploadStatus = ({ visible, count }: AlbumUploadStatusProps) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);

  if (!visible) return null;

  const label = count === 1 ? "Subiendo 1 foto…" : `Subiendo ${count} fotos…`;

  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.PRIMARY[500]} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      bottom: 24,
      left: 20,
      right: 92,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 25,
      backgroundColor: colors.NEUTRAL[200],
      shadowColor: colors.SHADOW,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 3,
    },
    label: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.NEUTRAL[800],
    },
  });
