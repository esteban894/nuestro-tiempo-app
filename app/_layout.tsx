import { colors } from "@/constants/colors";
import { Inter_400Regular, Inter_700Bold } from "@expo-google-fonts/inter";
import { PlaywriteAUQLD_400Regular } from "@expo-google-fonts/playwrite-au-qld";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    PlaywriteAUQLD_400Regular,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <View style={styles.view}>
      <StatusBar style="inverted" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
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
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  view: { backgroundColor: colors.NEUTRAL[200], flex: 1 },
});
