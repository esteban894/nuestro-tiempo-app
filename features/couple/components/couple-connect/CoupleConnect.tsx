import { ThemeColors } from "@/constants/colors";
import { FlipCard, SegmentedControl, Title } from "@/features/common";
import { useThemeColors } from "@/features/theme";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { CreateCoupleCard } from "../create-couple-card/CreateCoupleCard";
import { JoinCoupleCard } from "../join-couple-card/JoinCoupleCard";

type Mode = "create" | "join";

const OPTIONS = [
  { label: "Crear", value: "create" },
  { label: "Unirse", value: "join" },
];

export const CoupleConnect = () => {
  const [mode, setMode] = useState<Mode>("create");
  const colors = useThemeColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Title
        title="Vincula tu cuenta con la de tu pareja"
        variant="subtitle"
        align="center"
        style={styles.subtitle}
      />

      <SegmentedControl
        options={OPTIONS}
        value={mode}
        onChange={(value) => setMode(value as Mode)}
        style={styles.toggle}
      />

      <FlipCard
        isFlipped={mode === "join"}
        front={<CreateCoupleCard />}
        back={<JoinCoupleCard />}
        style={styles.card}
      />
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
    },
    subtitle: {
      color: colors.NEUTRAL[600],
      marginBottom: 20,
    },
    toggle: {
      marginBottom: 24,
    },
    card: {
      minHeight: 380,
    },
  });
