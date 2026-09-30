import {
  ApiError,
  configureApiAuth,
  isTransientError,
  type RefreshOutcome,
} from "@/features/common/api/httpClient";
import { queryClient } from "@/features/common/api/queryClient";
import { showSessionExpiredToast } from "@/features/common/components/ui/toast/showSessionExpiredToast";
import { setStoredValue } from "@/features/common/utils/crossPlatformStorage";
import { unregisterForPushNotifications } from "@/features/notifications/utils/registerForPushNotifications";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import type { UserInfo } from "../api/auth.api";
import * as authApi from "../api/auth.api";

const ACCESS_TOKEN_KEY = "auth.accessToken";
const REFRESH_TOKEN_KEY = "auth.refreshToken";
/** Cached so a cold start without connectivity can restore the session instead of
 *  bouncing the user to login — /auth/me is unreachable but the tokens are still valid. */
const USER_KEY = "auth.user";
/** Why and when the last session ended — kept to diagnose unexpected logouts. */
export const LAST_SESSION_END_KEY = "auth.lastSessionEnd";

/** Backoff before the 2nd and 3rd refresh attempt on a transient failure. Retrying with
 *  the same refresh token is safe: the API accepts a replay within its grace window and
 *  recovers a rotation whose response was lost after it. */
export const REFRESH_RETRY_DELAYS_MS = [500, 1500] as const;

export type SessionEndReason =
  /** The API refused the refresh token (expired, revoked, reused). */
  | "refresh_rejected"
  /** There was no refresh token to refresh with. */
  | "no_refresh_token"
  /** The API rejected the session at launch (e.g. the user no longer exists). */
  | "hydrate_rejected"
  /** The user logged out. */
  | "user_logout";

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

type AuthState = {
  user: UserInfo | null;
  accessToken: string | null;
  status: AuthStatus;
  hydrate: () => Promise<void>;
  setSession: (
    user: UserInfo,
    tokens: { access_token: string; refresh_token: string },
  ) => Promise<void>;
  logout: () => Promise<void>;
};

function readCachedUser(raw: string | null): UserInfo | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserInfo;
  } catch {
    return null;
  }
}

/** Only a definite answer from the API ends a session: a 4xx other than 429. Anything
 *  else — no connectivity, a 5xx during a deploy, throttling, a storage hiccup — says
 *  nothing about whether the tokens are still good. */
function isSessionRejection(error: unknown): boolean {
  return (
    error instanceof ApiError && error.status >= 400 && error.status < 500 && error.status !== 429
  );
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  status: "idle",

  hydrate: async () => {
    set({ status: "loading" });

    const [accessToken, refreshToken, cachedUserRaw] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.getItemAsync(USER_KEY),
    ]);

    if (!accessToken || !refreshToken) {
      set({ status: "unauthenticated" });
      return;
    }

    set({ accessToken });

    try {
      const user = await authApi.me();
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      set({ user, status: "authenticated" });
    } catch (error) {
      if (isSessionRejection(error)) {
        // If the refresh was refused, the session is already cleared (with its own
        // reason); this covers /auth/me itself being refused.
        await clearSession({ reason: "hydrate_rejected", notify: true });
        return;
      }

      // Transient failure (offline, server error, refresh unavailable): the tokens
      // weren't rejected, so wiping them would log the user out for having no signal.
      const cachedUser = readCachedUser(cachedUserRaw);
      if (cachedUser) {
        set({ user: cachedUser, status: "authenticated" });
        return;
      }
      // Nothing to render an authenticated app with, but keep the stored tokens so the
      // next launch can try again instead of forcing a fresh login.
      set({ accessToken: null, status: "unauthenticated" });
    }
  },

  setSession: async (user, tokens) => {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.access_token),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refresh_token),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
    ]);
    set({ user, accessToken: tokens.access_token, status: "authenticated" });
  },

  logout: async () => {
    // Remove this device's push token first, while the session is still
    // authenticated — otherwise the token lingers in the DB and keeps
    // accumulating across logins/reinstalls.
    await unregisterForPushNotifications();
    try {
      await authApi.logout();
    } catch {}
    await clearSession({ reason: "user_logout" });
  },
}));

/**
 * Ends the session locally and records why. `notify` marks the sessions the user didn't
 * end themselves — those get a toast, since the route gate otherwise drops them on the
 * login screen with no explanation. A deliberate logout stays silent.
 */
async function clearSession({ reason, notify = false }: { reason: SessionEndReason; notify?: boolean }) {
  // Concurrent 401s all reject off the same refresh promise and land here; only the first
  // should wipe storage and toast.
  if (useAuthStore.getState().status === "unauthenticated") return;
  useAuthStore.setState({ user: null, accessToken: null, status: "unauthenticated" });

  if (reason !== "user_logout") {
    console.warn(`[auth] session ended: ${reason}`);
  }

  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    SecureStore.deleteItemAsync(USER_KEY),
    setStoredValue(LAST_SESSION_END_KEY, JSON.stringify({ reason, at: new Date().toISOString() })).catch(
      () => {},
    ),
  ]);
  // queryClient.clear() also wipes the Couple query cache, so no explicit couple reset is needed.
  queryClient.clear();
  if (notify) showSessionExpiredToast();
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** POST /auth/refresh, retrying transient failures with backoff. */
async function requestRefresh(refreshToken: string) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await authApi.refreshAccessToken(refreshToken);
    } catch (error) {
      if (attempt >= REFRESH_RETRY_DELAYS_MS.length || !isTransientError(error)) throw error;
      await wait(REFRESH_RETRY_DELAYS_MS[attempt]);
    }
  }
}

let refreshPromise: Promise<string | null> | null = null;

/** Single-flight: concurrent 401s share one POST /auth/refresh. This matters more than it
 *  looks — refresh tokens are single-use, so a second parallel refresh would send an
 *  already-rotated token. Resolves to null only when there's nothing to refresh with;
 *  anything else throws so the caller can tell "token rejected" apart from "no
 *  connectivity". */
async function refreshSession(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    if (!refreshToken) return null;

    const { access_token, refresh_token } = await requestRefresh(refreshToken);
    // Both, always: the token we just sent is revoked server-side.
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access_token),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh_token),
    ]);
    useAuthStore.setState({ accessToken: access_token });
    return access_token;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

/**
 * Resolves once no session refresh is in flight. A JS reload (e.g. applying an OTA
 * update) in the middle of a refresh would lose the rotated token the API just issued,
 * so reloads wait for this first.
 */
export async function waitForPendingRefresh(): Promise<void> {
  while (refreshPromise) {
    await refreshPromise.catch(() => {});
  }
}

export async function handleUnauthorized(): Promise<RefreshOutcome> {
  try {
    const token = await refreshSession();
    if (token) return { status: "refreshed", token };
    await clearSession({ reason: "no_refresh_token", notify: true });
    return { status: "rejected" };
  } catch (error) {
    if (isSessionRejection(error)) {
      await clearSession({ reason: "refresh_rejected", notify: true });
      return { status: "rejected" };
    }
    // A dropped connection or a server error says nothing about the token's validity —
    // keep the session and let the original request fail as "offline".
    return { status: "unavailable", cause: error };
  }
}

configureApiAuth({
  getAccessToken: () => useAuthStore.getState().accessToken,
  onUnauthorized: handleUnauthorized,
});
