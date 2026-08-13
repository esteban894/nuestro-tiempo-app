import { ThemeColors } from "@/constants/colors";
import { Button, Card, Title } from "@/features/common";
import { useThemeColors } from "@/features/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text } from "react-native";

export const NoCurrentAlbumBanner = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const styles = createStyles(colors);

  return (
    <Card cardStyles={styles.card}>
      <Ionicons name="bookmark-outline" size={40} color={colors.PRIMARY[500]} />
      <Title
        title={t("albums.noCurrentAlbumBanner.title")}
        variant="h3"
        align="center"
        style={styles.title}
      />
      <Text style={styles.description}>{t("albums.noCurrentAlbumBanner.description")}</Text>
      <Button
        title={t("albums.noCurrentAlbumBanner.cta")}
        leftIcon="albums-outline"
        onPress={() => router.navigate("/albums")}
        style={styles.button}
      />
    </Card>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      alignItems: "center",
    },
    title: {
      marginTop: 12,
      marginBottom: 8,
      color: colors.PRIMARY[800],
    },
    description: {
      fontSize: 14,
      color: colors.NEUTRAL[800],
      textAlign: "center",
      marginBottom: 20,
    },
    button: {
      alignSelf: "stretch",
    },
  });
