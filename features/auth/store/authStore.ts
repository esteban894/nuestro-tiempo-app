import { configureApiAuth, isNetworkError } from "@/features/common/api/httpClient";
import { queryClient } from "@/features/common/api/queryClient";
import { showSessionExpiredToast } from "@/features/common/components/ui/toast/showSessionExpiredToast";
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
      // Offline launch: the tokens haven't been rejected, we just couldn't reach the
      // API. Wiping credentials here would log the user out for having no signal.
      const cachedUser = readCachedUser(cachedUserRaw);
      if (isNetworkError(error) && cachedUser) {
        set({ user: cachedUser, status: "authenticated" });
        return;
      }
      await clearSession();
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
    await clearSession();
  },
}));

/** `expired` marks the sessions the user didn't end themselves (rejected or rotated-away
 *  tokens) — those get a toast, since the route gate otherwise drops them on the login
 *  screen with no explanation. A deliberate logout stays silent. */
async function clearSession(options?: { expired?: boolean }) {
  // Concurrent 401s all reject off the same refresh promise and land here; only the first
  // should wipe storage and toast.
  if (useAuthStore.getState().status === "unauthenticated") return;
  useAuthStore.setState({ user: null, accessToken: null, status: "unauthenticated" });

  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    SecureStore.deleteItemAsync(USER_KEY),
  ]);
  // queryClient.clear() also wipes the Couple query cache, so no explicit couple reset is needed.
  queryClient.clear();
  if (options?.expired) showSessionExpiredToast();
}

let refreshPromise: Promise<string | null> | null = null;

/** Single-flight: concurrent 401s share one POST /auth/refresh. This matters more than it
 *  looks — refresh tokens are single-use, so a second parallel refresh would send an
 *  already-rotated token and (past the API's grace window) revoke the whole token family.
 *  Resolves to null only when there's nothing to refresh with; anything else throws so the
 *  caller can tell "token rejected" apart from "no connectivity". */
async function refreshSession(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    if (!refreshToken) return null;

    const { access_token, refresh_token } = await authApi.refreshAccessToken(refreshToken);
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

configureApiAuth({
  getAccessToken: () => useAuthStore.getState().accessToken,
  onUnauthorized: async () => {
    try {
      const token = await refreshSession();
      if (!token) await clearSession({ expired: true });
      return token;
    } catch (error) {
      // A dropped connection says nothing about the token's validity — keep the session
      // and let the original request surface as a network error.
      if (isNetworkError(error)) return null;
      await clearSession({ expired: true });
      return null;
    }
  },
});
