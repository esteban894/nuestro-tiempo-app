import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import es from "./locales/es.json";

// Initialized once at import time; features/theme/store/themeStore.ts is the pattern this
// mirrors, except the resolved value here also drives this module-level i18next instance
// rather than only React state, since some consumers (showErrorToast) run outside React.
i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export { i18n };
