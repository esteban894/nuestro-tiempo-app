import * as Localization from "expo-localization";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { create } from "zustand";
import { i18n } from "../i18n";

const LANGUAGE_KEY = "language.mode";

export type LanguageMode = "es" | "en";

type LanguageState = {
  language: LanguageMode;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setLanguage: (language: LanguageMode) => Promise<void>;
};

function resolveDeviceLanguage(): LanguageMode {
  const deviceLanguageCode = Localization.getLocales()[0]?.languageCode;
  return deviceLanguageCode?.toLowerCase().startsWith("es") ? "es" : "en";
}

async function getStoredLanguage(): Promise<LanguageMode | null> {
  const value =
    Platform.OS === "web"
      ? window.localStorage.getItem(LANGUAGE_KEY)
      : await SecureStore.getItemAsync(LANGUAGE_KEY);

  return value === "es" || value === "en" ? value : null;
}

async function setStoredLanguage(language: LanguageMode): Promise<void> {
  if (Platform.OS === "web") {
    window.localStorage.setItem(LANGUAGE_KEY, language);
    return;
  }
  await SecureStore.setItemAsync(LANGUAGE_KEY, language);
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: "en",
  hydrated: false,

  hydrate: async () => {
    const storedLanguage = await getStoredLanguage();
    const language = storedLanguage ?? resolveDeviceLanguage();

    await i18n.changeLanguage(language);
    set({ language, hydrated: true });
  },

  setLanguage: async (language) => {
    await setStoredLanguage(language);
    await i18n.changeLanguage(language);
    set({ language });
  },
}));
