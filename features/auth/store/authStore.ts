import { configureApiAuth } from "@/features/common/api/httpClient";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import * as authApi from "../api/auth.api";
import type { UserInfo } from "../api/auth.api";

const ACCESS_TOKEN_KEY = "auth.accessToken";
const REFRESH_TOKEN_KEY = "auth.refreshToken";

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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  status: "idle",

  hydrate: async () => {
    set({ status: "loading" });

    const [accessToken, refreshToken] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    ]);

    if (!accessToken || !refreshToken) {
      set({ status: "unauthenticated" });
      return;
    }

    set({ accessToken });

    try {
      const user = await authApi.me();
      set({ user, status: "authenticated" });
    } catch {
      await clearSession();
    }
  },

  setSession: async (user, tokens) => {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.access_token),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refresh_token),
    ]);
    set({ user, accessToken: tokens.access_token, status: "authenticated" });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Clear the local session regardless of whether the server call succeeded.
    }
    await clearSession();
  },
}));

async function clearSession() {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
  useAuthStore.setState({ user: null, accessToken: null, status: "unauthenticated" });
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshSession(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    if (!refreshToken) return null;

    try {
      const { access_token } = await authApi.refreshAccessToken(refreshToken);
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access_token);
      useAuthStore.setState({ accessToken: access_token });
      return access_token;
    } catch {
      return null;
    }
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
    const token = await refreshSession();
    if (!token) {
      await clearSession();
    }
    return token;
  },
});
