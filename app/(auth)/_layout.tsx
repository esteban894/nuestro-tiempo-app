import { Stack } from "expo-router";
import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false, title: "Login" }} />
      <Stack.Screen name="register" options={{ headerShown: false, title: "Register" }} />
    </Stack>
  );
}
