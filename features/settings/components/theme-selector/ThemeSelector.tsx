import { ThemeColors } from "@/constants/colors";
import { SegmentedControl, Title } from "@/features/common";
import { ThemeMode, useThemeColors, useThemeStore } from "@/features/theme";
import { StyleSheet, View } from "react-native";

const OPTIONS: { label: string; value: ThemeMode }[] = [
  { label: "Claro", value: "light" },
  { label: "Oscuro", value: "dark" },
  { label: "Sistema", value: "system" },
];

export const ThemeSelector = () => {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  return (
    <View style={styles.container}>
      <Title title="Apariencia" variant="h3" style={styles.title} />
      <SegmentedControl
        options={OPTIONS}
        value={mode}
        onChange={(value) => setMode(value as ThemeMode)}
      />
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      padding: 20,
      gap: 12,
      flex: 1,
      backgroundColor: colors.NEUTRAL[200],
    },
    title: {
      marginBottom: 4,
    },
  });
