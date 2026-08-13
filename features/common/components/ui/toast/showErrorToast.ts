import { i18n } from "@/features/i18n";
import Toast from "react-native-toast-message";
import { ApiError, isNetworkError } from "../../../api/httpClient";

export function showErrorToast(error: unknown) {
  if (isNetworkError(error)) {
    Toast.show({
      type: "error",
      text1: i18n.t("errors.offlineTitle"),
      text2: i18n.t("errors.offlineMessage"),
    });
    return;
  }

  if (error instanceof ApiError) {
    // Codes come from the API's `error` field (see httpClient.ts). Codes without a
    // dictionary entry — e.g. Nest's validation-pipe "Bad Request" — fall back to a
    // generic translated message rather than showing raw, untranslated API text.
    const key = error.code ? `errors.${error.code}` : undefined;
    const text2 = key && i18n.exists(key) ? i18n.t(key) : i18n.t("errors.fallback");
    Toast.show({ type: "error", text1: i18n.t("errors.genericTitle"), text2 });
    return;
  }

  Toast.show({ type: "error", text1: i18n.t("errors.genericTitle"), text2: i18n.t("errors.fallback") });
}
