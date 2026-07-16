import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { registerPushToken, removePushToken } from "../api/notifications.api";

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

export async function registerForPushNotifications() {
  try {
    const token = await getExpoPushToken({ requestPermission: true });
    if (!token) return;

    await registerPushToken(token);
  } catch {
    // Push registration is best-effort — the app must keep working without it
    // (e.g. simulators, offline device, missing push credentials).
  }
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
  }
}
