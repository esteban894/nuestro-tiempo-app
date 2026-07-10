import { ThemeColors } from "@/constants/colors";
import { AccountMenu } from "@/features/account";
import { Title } from "@/features/common";
import { useThemeColors } from "@/features/theme";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";

export default function AccountScreen() {
  const colors = useThemeColors();
  const styles = createStyles(colors);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Title title="Mi cuenta" variant="h2" style={styles.title} />
      <AccountMenu />
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.NEUTRAL[200],
    },
    contentContainer: {
      padding: 20,
    },
    title: {
      marginBottom: 20,
    },
  });
