import { getStoredValue, setStoredValue } from "@/features/common/utils/crossPlatformStorage";
import * as Localization from "expo-localization";
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
  const value = await getStoredValue(LANGUAGE_KEY);
  return value === "es" || value === "en" ? value : null;
}

async function setStoredLanguage(language: LanguageMode): Promise<void> {
  await setStoredValue(LANGUAGE_KEY, language);
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
