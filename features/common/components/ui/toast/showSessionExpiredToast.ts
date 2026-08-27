import { i18n } from "@/features/i18n";
import Toast from "react-native-toast-message";

/** Shown when the session ends without the user asking for it — an expired/rotated
 *  refresh token, or a token the API no longer accepts. Kept separate from
 *  showErrorToast because it isn't tied to a failed request the user triggered:
 *  clearSession() fires it while the route gate is already sending them to login. */
export function showSessionExpiredToast() {
  Toast.show({
    type: "error",
    text1: i18n.t("errors.sessionExpiredTitle"),
    text2: i18n.t("errors.sessionExpired"),
  });
}
