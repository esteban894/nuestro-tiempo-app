import { ThemeColors } from "@/constants/colors";
import { SegmentedControl, Title } from "@/features/common";
import { LanguageMode, useLanguageStore } from "@/features/i18n";
import { useThemeColors } from "@/features/theme";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

export const LanguageSelector = () => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  const options: { label: string; value: LanguageMode }[] = [
    { label: t("settings.languageEs"), value: "es" },
    { label: t("settings.languageEn"), value: "en" },
  ];

  return (
    <View style={styles.container}>
      <Title title={t("settings.language")} variant="h3" style={styles.title} />
      <SegmentedControl
        options={options}
        value={language}
        onChange={(value) => setLanguage(value as LanguageMode)}
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
