import type { TFunction } from "i18next";
import { resolveApiErrorText } from "./resolveApiErrorText";

/** Inline-field counterpart to showErrorToast.ts — same code-to-dictionary-key
 *  resolution, but returns a string for forms that render the error next to a field
 *  instead of a toast (mutations set `meta.suppressErrorToast` for those). Takes `t` from
 *  the caller's useTranslation() so the message re-renders on language change. */
export function getErrorMessage(error: unknown, t: TFunction): string | undefined {
  if (!error) return undefined;
  return resolveApiErrorText(error, t);
}
