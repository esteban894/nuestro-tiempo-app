import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { getDeviceTimeZone } from "@/features/common/utils/deviceTimeZone";
import { Platform } from "react-native";
import { registerPushToken, removePushToken } from "../api/notifications.api";

/** What was last registered: the token plus the zone it was registered with. */
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

/** Identity of a registration: re-register whenever the token OR the zone changes. */
function registrationKey(token: string, timeZone: string | null): string {
  return `${token}|${timeZone ?? ""}`;
}

/**
 * Registers this device's push token with the API, together with its current time zone.
 * Cheap to call often (e.g. every time the app returns to the foreground): it only hits
 * the API when the token or the zone changed since the last successful registration —
 * the zone changes when the user travels.
 */
export function registerForPushNotifications({
  requestPermission = true,
}: { requestPermission?: boolean } = {}): Promise<void> {
  if (registerInFlight) return registerInFlight;

  registerInFlight = (async () => {
    try {
      const token = await getExpoPushToken({ requestPermission });
      if (!token) return;

      const timeZone = getDeviceTimeZone();
      const key = registrationKey(token, timeZone);
      const lastRegistered = await SecureStore.getItemAsync(LAST_REGISTERED_PUSH_TOKEN_KEY);
      if (key === lastRegistered) return;

      await registerPushToken(token, timeZone);
      await SecureStore.setItemAsync(LAST_REGISTERED_PUSH_TOKEN_KEY, key);
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
