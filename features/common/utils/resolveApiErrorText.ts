import { i18n } from "@/features/i18n";
import type { TFunction } from "i18next";
import { ApiError, isNetworkError } from "../api/httpClient";

/** Shared network/ApiError → translated-message resolution used by both
 *  showErrorToast (toast) and getErrorMessage (inline field error).
 *
 *  The API speaks in three error shapes: a domain error carrying a stable `error` code, a
 *  class-validator error whose `message` is an array of raw English strings, and the rate
 *  limiter's bare JSON string with no code at all. Only the first is safe to branch on, so
 *  the other two are resolved by status — never by the server's message text, which is
 *  untranslated and not a contract. */
export function resolveApiErrorText(error: unknown, t: TFunction): string {
  if (isNetworkError(error)) return t("errors.offlineMessage");

  if (error instanceof ApiError) {
    // The throttler's response has no code and no `message` field to key off.
    if (error.status === 429) return t("errors.tooManyRequests");

    const key = error.code ? `errors.${error.code}` : undefined;
    if (key && i18n.exists(key)) return t(key);

    if (error.status === 400) return t("errors.validation");
    if (error.status === 401) return t("errors.sessionExpired");
  }

  return t("errors.fallback");
}
