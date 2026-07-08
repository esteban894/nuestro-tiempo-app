import { useAuthStore } from "@/features/auth";
import { ListItem } from "@/features/common";
import { useCoupleStore } from "@/features/couple";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

export const AccountMenu = () => {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const couple = useCoupleStore((state) => state.couple);

  const partner =
    couple && couple.user2
      ? couple.user1.id === currentUserId
        ? couple.user2
        : couple.user1
      : null;

  const coupleLabel = partner ? `En pareja con ${partner.name}` : "Vincular con tu pareja";
  const coupleIcon = partner ? "heart" : "people-outline";

  return (
    <View style={styles.container}>
      <ListItem
        leftIcon={coupleIcon}
        label={coupleLabel}
        onPress={partner ? undefined : () => router.navigate("/couple")}
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
