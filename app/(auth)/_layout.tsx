import { useThemeColors } from "@/features/theme";
import { Stack } from "expo-router";
import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const colors = useThemeColors();

  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: colors.NEUTRAL[200] } }}>
      <Stack.Screen name="login" options={{ headerShown: false, title: "Login" }} />
      <Stack.Screen name="register" options={{ headerShown: false, title: "Register" }} />
    </Stack>
  );
}
