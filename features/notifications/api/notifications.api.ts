import { apiFetch } from "@/features/common/api/httpClient";

export function registerPushToken(token: string) {
  return apiFetch<void>("/notifications/push-token", { method: "POST", body: { token } });
}

export function removePushToken(token: string) {
  return apiFetch<void>("/notifications/push-token", { method: "DELETE", body: { token } });
}
