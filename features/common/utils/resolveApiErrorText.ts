import { i18n } from "@/features/i18n";
import type { TFunction } from "i18next";
import { ApiError, isNetworkError } from "../api/httpClient";

/** Shared network/ApiError → translated-message resolution used by both
 *  showErrorToast (toast) and getErrorMessage (inline field error). Codes come
 *  from the API's `error` field (see httpClient.ts); codes without a dictionary
 *  entry — e.g. Nest's validation-pipe "Bad Request" — fall back to a generic
 *  translated message rather than showing raw, untranslated API text. */
export function resolveApiErrorText(error: unknown, t: TFunction): string {
  if (isNetworkError(error)) return t("errors.offlineMessage");

  if (error instanceof ApiError) {
    const key = error.code ? `errors.${error.code}` : undefined;
    return key && i18n.exists(key) ? t(key) : t("errors.fallback");
  }

  return t("errors.fallback");
}
