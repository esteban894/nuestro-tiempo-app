import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { registerPushToken, removePushToken } from "../api/notifications.api";

const LAST_REGISTERED_PUSH_TOKEN_KEY = "lastRegisteredPushToken";

/**
 * Resolves this device's Expo push token, or `null` when it can't be obtained
 * (simulator, permission not granted, missing project id). Only requests the
 * OS permission prompt when `requestPermission` is set — the unregister path
 * must never prompt the user on logout.
 */
async function getExpoPushToken(options?: { requestPermission?: boolean }): Promise<string | null> {
  if (!Device.isDevice) return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted" && options?.requestPermission) {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) return null;

  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  return token;
}

let registerInFlight: Promise<void> | null = null;

/**
 * Registers this device's Expo push token with the backend. Called both on
 * auth and from `addPushTokenListener`, which on Android can fire several
 * times in quick succession when FCM rotates the underlying device token
 * (notably after the app spent days in the background) — without guarding
 * against that, each firing was an independent POST, bursting the backend's
 * rate limit. Two guards keep this idempotent:
 * - an in-flight lock so concurrent callers await the same run instead of
 *   starting their own;
 * - a SecureStore record of the last token actually registered, skipping the
 *   POST entirely when the resolved token hasn't changed.
 */
export function registerForPushNotifications(): Promise<void> {
  if (registerInFlight) return registerInFlight;

  registerInFlight = (async () => {
    try {
      const token = await getExpoPushToken({ requestPermission: true });
      if (!token) return;

      const lastRegisteredToken = await SecureStore.getItemAsync(LAST_REGISTERED_PUSH_TOKEN_KEY);
      if (token === lastRegisteredToken) return;

      await registerPushToken(token);
      await SecureStore.setItemAsync(LAST_REGISTERED_PUSH_TOKEN_KEY, token);
    } catch {
      // Push registration is best-effort — the app must keep working without it
      // (e.g. simulators, offline device, missing push credentials).
    } finally {
      registerInFlight = null;
    }
  })();

  return registerInFlight;
}

/**
 * Removes this device's current token from the backend. Call while the session
 * is still authenticated (before clearing it) so the DELETE is authorized —
 * otherwise the token is orphaned in the DB forever and keeps receiving pushes.
 */
export async function unregisterForPushNotifications() {
  try {
    const token = await getExpoPushToken();
    if (!token) return;

    await removePushToken(token);
  } catch {
    // Best-effort — a failed cleanup must never block logout.
  } finally {
    // Clear even if the DELETE above failed, so the next login re-registers
    // from a clean slate instead of assuming this stale token is still valid.
    await SecureStore.deleteItemAsync(LAST_REGISTERED_PUSH_TOKEN_KEY);
  }
}
