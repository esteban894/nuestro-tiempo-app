import { useAuthStore } from "@/features/auth";
import { ListItem } from "@/features/common";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

export const AccountMenu = () => {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  return (
    <View style={styles.container}>
      <ListItem
        leftIcon="people-outline"
        label="Vincular con tu pareja"
        onPress={() => router.navigate("/couple")}
      />
      <ListItem leftIcon="log-out-outline" label="Cerrar sesión" onPress={() => logout()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
});
