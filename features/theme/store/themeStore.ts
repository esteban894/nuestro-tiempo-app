import { getStoredValue, setStoredValue } from "@/features/common/utils/crossPlatformStorage";
import { Appearance } from "react-native";
import { create } from "zustand";

const THEME_MODE_KEY = "theme.mode";

export type ThemeMode = "system" | "light" | "dark";
export type ResolvedScheme = "light" | "dark";

type ThemeState = {
  mode: ThemeMode;
  systemScheme: ResolvedScheme;
  resolvedScheme: ResolvedScheme;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setMode: (mode: ThemeMode) => Promise<void>;
  setSystemScheme: (scheme: ResolvedScheme) => void;
};

function resolveScheme(mode: ThemeMode, systemScheme: ResolvedScheme): ResolvedScheme {
  return mode === "system" ? systemScheme : mode;
}

async function getStoredMode(): Promise<ThemeMode | null> {
  const value = await getStoredValue(THEME_MODE_KEY);
  return value === "system" || value === "light" || value === "dark" ? value : null;
}

async function setStoredMode(mode: ThemeMode): Promise<void> {
  await setStoredValue(THEME_MODE_KEY, mode);
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: "system",
  systemScheme: Appearance.getColorScheme() ?? "light",
  resolvedScheme: resolveScheme("system", Appearance.getColorScheme() ?? "light"),
  hydrated: false,

  hydrate: async () => {
    const storedMode = await getStoredMode();
    const systemScheme = Appearance.getColorScheme() ?? "light";
    const mode = storedMode ?? "system";

    set({
      mode,
      systemScheme,
      resolvedScheme: resolveScheme(mode, systemScheme),
      hydrated: true,
    });
  },

  setMode: async (mode) => {
    await setStoredMode(mode);
    set({ mode, resolvedScheme: resolveScheme(mode, get().systemScheme) });
  },

  setSystemScheme: (systemScheme) => {
    set({ systemScheme, resolvedScheme: resolveScheme(get().mode, systemScheme) });
  },
}));

export function subscribeToSystemScheme(): () => void {
  const subscription = Appearance.addChangeListener(({ colorScheme }) => {
    useThemeStore.getState().setSystemScheme(colorScheme ?? "light");
  });

  return () => subscription.remove();
}
