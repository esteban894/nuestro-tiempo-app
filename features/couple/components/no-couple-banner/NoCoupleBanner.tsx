import { ThemeColors } from "@/constants/colors";
import { Button, Card, Title } from "@/features/common";
import { useThemeColors } from "@/features/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text } from "react-native";

export const NoCoupleBanner = () => {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = createStyles(colors);

  return (
    <Card cardStyles={styles.card}>
      <Ionicons name="heart-dislike-outline" size={40} color={colors.PRIMARY[500]} />
      <Title title="Todavía no tenés pareja vinculada" variant="h3" align="center" style={styles.title} />
      <Text style={styles.description}>
        Para ver la información de tu pareja primero tenés que vincularte con ella.
      </Text>
      <Button
        title="Vincular con mi pareja"
        leftIcon="link"
        onPress={() => router.navigate("/couple")}
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
