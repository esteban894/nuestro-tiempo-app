import { ListItem } from "@/features/common";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

export const AccountMenu = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ListItem
        leftIcon="people-outline"
        label="Vincular con tu pareja"
        onPress={() => router.navigate("/couple")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
});
