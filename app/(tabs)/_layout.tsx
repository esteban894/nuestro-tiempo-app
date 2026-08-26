import { ThemeColors } from "@/constants/colors";
import { useCoupleQuery } from "@/features/couple";
import { useThemeColors } from "@/features/theme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet } from "react-native";

export default function TabLayout() {
  // Prime the Couple query as soon as the tabs mount; the cache is shared with every screen.
  useCoupleQuery();
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const styles = createStyles(colors);

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        animation: "shift",
        sceneStyle: styles.scene,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.PRIMARY[500],
        tabBarInactiveTintColor: colors.NEUTRAL[800],
        tabBarShowLabel: false,
        headerStyle: styles.header,
        headerTitle: "Nuestro Tiempo",
        headerTitleStyle: styles.headerTitle,
        headerRight: () => (
          <Pressable
            onPress={() => router.push("/favorites")}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t("favorites.viewFavoritesA11y")}>
            <Ionicons name="heart" size={24} color={colors.PRIMARY[800]} />
          </Pressable>
        ),
        headerRightContainerStyle: styles.headerRightContainer,
      }}>
      <Tabs.Screen
        name="albums"
        options={{
          title: t("nav.albums"),
          tabBarAccessibilityLabel: t("nav.albums"),
          tabBarIcon: ({ focused, color }) => (
            <Ionicons size={28} name={focused ? "albums" : "albums-outline"} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: t("nav.home"),
          tabBarAccessibilityLabel: t("nav.home"),
          tabBarIcon: ({ focused, color }) => (
            <Ionicons size={28} name={focused ? "home" : "home-outline"} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: t("nav.calendar"),
          tabBarAccessibilityLabel: t("nav.calendar"),
          tabBarIcon: ({ focused, color }) => (
            <Ionicons size={28} name={focused ? "calendar" : "calendar-outline"} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: t("nav.account"),
          tabBarAccessibilityLabel: t("nav.account"),
          tabBarIcon: ({ focused, color }) => (
            <Ionicons size={28} name={focused ? "person" : "person-outline"} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    scene: {
      backgroundColor: colors.NEUTRAL[200],
    },
    tabBar: {
      backgroundColor: colors.NEUTRAL[200],
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 10,
      paddingBottom: 10,
      borderTopWidth: 0,
      elevation: 0,
      shadowOpacity: 0,
    },
    header: {
      backgroundColor: colors.NEUTRAL[200],
      shadowColor: "transparent",
    },
    headerTitle: {
      color: colors.PRIMARY[800],
      fontFamily: "Parisienne_400Regular",
    },
    headerRightContainer: {
      paddingRight: 15,
    },
  });
