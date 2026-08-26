import { i18n } from "@/features/i18n";
import Toast from "react-native-toast-message";
import { isNetworkError } from "../../../api/httpClient";
import { resolveApiErrorText } from "../../../utils/resolveApiErrorText";

export function showErrorToast(error: unknown) {
  const title = isNetworkError(error) ? i18n.t("errors.offlineTitle") : i18n.t("errors.genericTitle");
  Toast.show({ type: "error", text1: title, text2: resolveApiErrorText(error, i18n.t) });
}
