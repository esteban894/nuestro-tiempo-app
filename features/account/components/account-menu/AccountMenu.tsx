import { useAuthStore } from "@/features/auth";
import { ListItem } from "@/features/common";
import { useCoupleQuery } from "@/features/couple";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

export const AccountMenu = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const { data: couple } = useCoupleQuery();

  const partner =
    couple && couple.user2
      ? couple.user1.id === currentUserId
        ? couple.user2
        : couple.user1
      : null;

  const coupleLabel = partner
    ? t("account.coupleWith", { name: partner.name })
    : t("account.linkCouple");
  const coupleIcon = partner ? "heart" : "people-outline";

  return (
    <View style={styles.container}>
      <ListItem
        leftIcon={coupleIcon}
        label={coupleLabel}
        onPress={partner ? undefined : () => router.navigate("/couple")}
      />
      <ListItem
        leftIcon="settings-outline"
        label={t("account.settings")}
        onPress={() => router.navigate("/settings")}
      />
      <ListItem leftIcon="log-out-outline" label={t("account.logout")} onPress={() => logout()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
});
