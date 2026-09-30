import { apiFetch } from "@/features/common/api/httpClient";

/** Registers this device's push token and, with it, the zone the device is in — the API
 *  renders dates/times in pushes to this device in that zone. */
export function registerPushToken(token: string, timeZone: string | null) {
  return apiFetch<void>("/notifications/push-token", {
    method: "POST",
    body: timeZone ? { token, timeZone } : { token },
  });
}

export function removePushToken(token: string) {
  return apiFetch<void>("/notifications/push-token", { method: "DELETE", body: { token } });
}
