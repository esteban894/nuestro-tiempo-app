import { i18n } from "@/features/i18n";
import Toast from "react-native-toast-message";
import { ApiError, isNetworkError } from "../../../api/httpClient";
import { resolveApiErrorText } from "../../../utils/resolveApiErrorText";

export function showErrorToast(error: unknown) {
  // An unrecoverable 401 has already been handled by the auth store, which clears the
  // session and shows its own "session expired" toast. Repeating it here would just
  // overwrite that one with a vaguer title.
  if (error instanceof ApiError && error.status === 401) return;

  const title = isNetworkError(error) ? i18n.t("errors.offlineTitle") : i18n.t("errors.genericTitle");
  Toast.show({ type: "error", text1: title, text2: resolveApiErrorText(error, i18n.t) });
}
