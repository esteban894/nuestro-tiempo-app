import { ThemeColors } from "@/constants/colors";
import { useAuthStore } from "@/features/auth";
import { AppToast, Button, queryClient, useReactQueryAppState } from "@/features/common";
import {
  handleNotificationReceived,
  handleNotificationResponse,
  registerForPushNotifications,
} from "@/features/notifications";
import "@/features/notifications/notificationHandler";
import { subscribeToSystemScheme, useThemeColors, useThemeStore } from "@/features/theme";
import { useOtaUpdates } from "@/features/updates";
import { ElmsSans_400Regular, ElmsSans_700Bold } from "@expo-google-fonts/elms-sans";
import { Parisienne_400Regular } from "@expo-google-fonts/parisienne";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { ErrorBoundaryProps, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { enableFreeze } from "react-native-screens";

enableFreeze(true);

SplashScreen.setOptions({
  fade: true,
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ElmsSans_400Regular,
    ElmsSans_700Bold,
    Parisienne_400Regular,
  });

  const status = useAuthStore((state) => state.status);
  const hydrate = useAuthStore((state) => state.hydrate);

  const themeHydrated = useThemeStore((state) => state.hydrated);
  const themeHydrate = useThemeStore((state) => state.hydrate);
  const resolvedScheme = useThemeStore((state) => state.resolvedScheme);
  const themeColors = useThemeColors();
  const styles = createStyles(themeColors);

  useOtaUpdates();
  useReactQueryAppState();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    themeHydrate();
  }, [themeHydrate]);

  useEffect(() => {
    return subscribeToSystemScheme();
  }, []);

  useEffect(() => {
    if ((loaded || error) && status !== "idle" && status !== "loading" && themeHydrated) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error, status, themeHydrated]);

  useEffect(() => {
    if (status !== "authenticated") return;

    registerForPushNotifications();

    const receivedSubscription = Notifications.addNotificationReceivedListener(
      handleNotificationReceived,
    );
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse,
    );
    // When the underlying push token rolls, re-register so the backend always
    // has this device's current Expo token (stale ones are cleaned up server-side).
    const pushTokenSubscription = Notifications.addPushTokenListener(() => {
      registerForPushNotifications();
    });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
      pushTokenSubscription.remove();
    };
  }, [status]);

  if (!loaded && !error) {
    return null;
  }

  if (status === "idle" || status === "loading" || !themeHydrated) {
    return null;
  }

  const isAuthenticated = status === "authenticated";

  return (
    <View style={styles.view}>
      <StatusBar style={resolvedScheme === "dark" ? "light" : "dark"} />
      <KeyboardProvider>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ contentStyle: { backgroundColor: themeColors.NEUTRAL[200] } }}>
            <Stack.Protected guard={isAuthenticated}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack.Protected>
            <Stack.Protected guard={!isAuthenticated}>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            </Stack.Protected>
            <Stack.Screen
              name="couple"
              options={{
                headerTitle: "Vincular pareja",
                headerBackTitle: "Cuenta",
                headerTintColor: themeColors.PRIMARY[800],
                headerStyle: { backgroundColor: themeColors.NEUTRAL[200] },
                headerShadowVisible: false,
              }}
            />
            <Stack.Screen
              name="settings"
              options={{
                headerTitle: "Configuración",
                headerBackTitle: "Cuenta",
                headerTintColor: themeColors.PRIMARY[800],
                headerStyle: { backgroundColor: themeColors.NEUTRAL[200] },
                headerShadowVisible: false,
              }}
            />
            <Stack.Screen
              name="favorites"
              options={{
                headerBackTitle: "Inicio",
                headerTintColor: themeColors.PRIMARY[800],
                headerStyle: { backgroundColor: themeColors.NEUTRAL[200] },
                headerShadowVisible: false,
              }}
            />
            <Stack.Screen
              name="album/[id]"
              options={{
                headerBackTitle: "Álbumes",
                headerTintColor: themeColors.PRIMARY[800],
                headerStyle: { backgroundColor: themeColors.NEUTRAL[200] },
                headerShadowVisible: false,
              }}
            />
            <Stack.Screen
              name="album/new"
              options={{
                headerTitle: "Nuevo álbum",
                headerBackTitle: "Álbumes",
                headerTintColor: themeColors.PRIMARY[800],
                headerStyle: { backgroundColor: themeColors.NEUTRAL[200] },
                headerShadowVisible: false,
              }}
            />
            <Stack.Screen
              name="album/[id]/edit"
              options={{
                headerTitle: "Editar álbum",
                headerBackTitle: "Álbum",
                headerTintColor: themeColors.PRIMARY[800],
                headerStyle: { backgroundColor: themeColors.NEUTRAL[200] },
                headerShadowVisible: false,
              }}
            />
          </Stack>
        </QueryClientProvider>
      </KeyboardProvider>
      <AppToast />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    view: { backgroundColor: colors.NEUTRAL[200], flex: 1 },
  });

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const colors = useThemeColors();
  const styles = createBoundaryStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Algo salió mal</Text>
      <Text style={styles.message}>{error.message}</Text>
      <Button title="Reintentar" leftIcon="refresh" onPress={retry} style={styles.button} />
    </View>
  );
}

const createBoundaryStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
      gap: 12,
      backgroundColor: colors.NEUTRAL[200],
    },
    title: {
      fontSize: 20,
      fontFamily: "ElmsSans_700Bold",
      fontWeight: "700",
      color: colors.PRIMARY[800],
      textAlign: "center",
    },
    message: {
      fontSize: 14,
      fontFamily: "ElmsSans_400Regular",
      color: colors.NEUTRAL[800],
      textAlign: "center",
      marginBottom: 8,
    },
    button: {
      marginTop: 4,
    },
  });
