import { AccountMenu } from "@/features/account";
import { Title } from "@/features/common";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";

export default function AccountScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Title title="Mi cuenta" variant="h2" style={styles.title} />
      <AccountMenu />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    marginBottom: 20,
    color: "#212121",
  },
});
