import { focusManager } from "@tanstack/react-query";
import { useEffect } from "react";
import { AppState, type AppStateStatus } from "react-native";

/**
 * Wires React Query's focus manager to React Native's `AppState`. React Query's default
 * focus detection listens for the DOM `visibilitychange` event, which doesn't exist in
 * React Native — so `refetchOnWindowFocus` never fires on its own here. Without this,
 * a screen left in the background can sit on stale data (e.g. S3 image URLs past their
 * signing window) indefinitely; this makes returning to the foreground revalidate it.
 *
 * Mirrors the AppState listener pattern already used in `useOtaUpdates`.
 */
export function useReactQueryAppState() {
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state: AppStateStatus) => {
      focusManager.setFocused(state === "active");
    });

    return () => subscription.remove();
  }, []);
}
