import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { registerPushToken, removePushToken } from "../api/notifications.api";

const LAST_REGISTERED_PUSH_TOKEN_KEY = "lastRegisteredPushToken";

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

export async function unregisterForPushNotifications() {
  try {
    const token = await getExpoPushToken();
    if (!token) return;

    await removePushToken(token);
  } catch {
    // Best-effort — a failed cleanup must never block logout.
  } finally {
    await SecureStore.deleteItemAsync(LAST_REGISTERED_PUSH_TOKEN_KEY);
  }
}
