import { colors } from "@/constants/colors";
import { useAuthStore } from "@/features/auth";
import { queryClient } from "@/features/common";
import { Inter_400Regular, Inter_700Bold } from "@expo-google-fonts/inter";
import { PlaywriteAUQLD_400Regular } from "@expo-google-fonts/playwrite-au-qld";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";

SplashScreen.setOptions({
  fade: true,
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    PlaywriteAUQLD_400Regular,
  });

  const status = useAuthStore((state) => state.status);
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if ((loaded || error) && status !== "idle" && status !== "loading") {
      SplashScreen.hideAsync();
    }
  }, [loaded, error, status]);

  if (!loaded && !error) {
    return null;
  }

  if (status === "idle" || status === "loading") {
    return null;
  }

  const isAuthenticated = status === "authenticated";

  return (
    <View style={styles.view}>
      <StatusBar style="inverted" />
      <QueryClientProvider client={queryClient}>
        <Stack>
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
              headerTintColor: colors.PRIMARY[800],
              headerStyle: { backgroundColor: colors.NEUTRAL[200] },
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="album/[id]"
            options={{
              headerBackTitle: "Álbumes",
              headerTintColor: colors.PRIMARY[800],
              headerStyle: { backgroundColor: colors.NEUTRAL[200] },
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="album/new"
            options={{
              headerTitle: "Nuevo álbum",
              headerBackTitle: "Álbumes",
              headerTintColor: colors.PRIMARY[800],
              headerStyle: { backgroundColor: colors.NEUTRAL[200] },
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="album/[id]/edit"
            options={{
              headerTitle: "Editar álbum",
              headerBackTitle: "Álbum",
              headerTintColor: colors.PRIMARY[800],
              headerStyle: { backgroundColor: colors.NEUTRAL[200] },
              headerShadowVisible: false,
            }}
          />
        </Stack>
      </QueryClientProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  view: { backgroundColor: colors.NEUTRAL[200], flex: 1 },
});
