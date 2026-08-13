import { ThemeColors } from "@/constants/colors";
import { useThemeColors } from "@/features/theme";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

interface AlbumHeaderProps {
  title: string;
  isPrivate: boolean;
}

export const AlbumHeader = ({ title, isPrivate }: AlbumHeaderProps) => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      {isPrivate && (
        <View style={styles.badge}>
          <Ionicons name="lock-closed" size={12} color={colors.NEUTRAL[800]} />
          <Text style={styles.badgeLabel}>{t("albums.privateBadge")}</Text>
        </View>
      )}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      marginVertical: 10,
      paddingHorizontal: 20,
      paddingTop: 20,
      alignItems: "center",
      gap: 10,
    },
    title: {
      color: colors.NEUTRAL[800],
      textAlign: "center",
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: colors.NEUTRAL[500],
    },
    badgeLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.NEUTRAL[800],
    },
  });
