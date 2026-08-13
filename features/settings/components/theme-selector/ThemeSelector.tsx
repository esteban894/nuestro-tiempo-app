import { ThemeColors } from "@/constants/colors";
import { SegmentedControl, Title } from "@/features/common";
import { ThemeMode, useThemeColors, useThemeStore } from "@/features/theme";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

export const ThemeSelector = () => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  const options: { label: string; value: ThemeMode }[] = [
    { label: t("settings.themeLight"), value: "light" },
    { label: t("settings.themeDark"), value: "dark" },
    { label: t("settings.themeSystem"), value: "system" },
  ];

  return (
    <View style={styles.container}>
      <Title title={t("settings.appearance")} variant="h3" style={styles.title} />
      <SegmentedControl
        options={options}
        value={mode}
        onChange={(value) => setMode(value as ThemeMode)}
      />
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 20,
      paddingTop: 20,
      gap: 12,
      backgroundColor: colors.NEUTRAL[200],
    },
    title: {
      marginBottom: 4,
    },
  });
