import { focusManager } from "@tanstack/react-query";
import { useEffect } from "react";
import { AppState, type AppStateStatus } from "react-native";

export function useReactQueryAppState() {
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state: AppStateStatus) => {
      focusManager.setFocused(state === "active");
    });

    return () => subscription.remove();
  }, []);
}
