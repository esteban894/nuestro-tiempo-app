import { ThemeColors } from "@/constants/colors";
import { useCoupleStore } from "@/features/couple";
import { useThemeColors } from "@/features/theme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { StyleSheet } from "react-native";

export default function TabLayout() {
  const fetchCouple = useCoupleStore((state) => state.fetchCouple);
  const colors = useThemeColors();
  const styles = createStyles(colors);

  useEffect(() => {
    fetchCouple();
  }, [fetchCouple]);

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.PRIMARY[500],
        tabBarInactiveTintColor: colors.NEUTRAL[800],
        tabBarShowLabel: false,
        headerStyle: styles.header,
        headerTitle: "Nuestro Tiempo",
        headerTitleStyle: styles.headerTitle,
        headerRight: () => <Ionicons name="heart" size={24} color={colors.PRIMARY[800]} />,
        headerRightContainerStyle: styles.headerRightContainer,
      }}>
      <Tabs.Screen
        name="albums"
        options={{
          title: "albums",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons size={28} name={focused ? "albums" : "albums-outline"} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "index",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons size={28} name={focused ? "home" : "home-outline"} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "account",
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
