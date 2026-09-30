import {
  apiFetch,
  ApiError,
  isNetworkError,
  SessionRefreshUnavailableError,
} from "@/features/common/api/httpClient";
import { showSessionExpiredToast } from "@/features/common/components/ui/toast/showSessionExpiredToast";
import { LAST_SESSION_END_KEY, useAuthStore, waitForPendingRefresh } from "../authStore";

const mockStore = new Map<string, string>();
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async (key: string) => mockStore.get(key) ?? null),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    mockStore.set(key, value);
  }),
  deleteItemAsync: jest.fn(async (key: string) => {
    mockStore.delete(key);
  }),
}));
jest.mock("@/features/notifications/utils/registerForPushNotifications", () => ({
  unregisterForPushNotifications: jest.fn(async () => {}),
}));
jest.mock("@/features/common/components/ui/toast/showSessionExpiredToast", () => ({
  showSessionExpiredToast: jest.fn(),
}));
jest.mock("expo-crypto", () => ({ randomUUID: () => "device-uuid" }));

const USER = { id: "u1", name: "Ana", email: "ana@test" };

/** One scripted outcome of a fetch: an HTTP response, or a dropped connection. */
type Outcome = { status: number; body?: unknown } | "network";

const routes: Record<string, Outcome[]> = {};
const calls: { path: string; auth?: string; body?: unknown }[] = [];

function script(path: string, ...outcomes: Outcome[]) {
  routes[path] = outcomes;
}
const callsTo = (path: string) => calls.filter((call) => call.path === path);

const fetchMock = jest.fn(async (url: string, init: RequestInit = {}) => {
  const path = url.replace("https://api.test", "").split("?")[0];
  const headers = (init.headers ?? {}) as Record<string, string>;
  calls.push({
    path,
    auth: headers.Authorization,
    body: typeof init.body === "string" ? JSON.parse(init.body) : undefined,
  });
  const outcome = routes[path]?.shift() ?? { status: 404, body: { message: "unscripted" } };
  if (outcome === "network") throw new TypeError("Network request failed");
  return {
    status: outcome.status,
    ok: outcome.status >= 200 && outcome.status < 300,
    statusText: String(outcome.status),
    text: async () => (outcome.body === undefined ? "" : JSON.stringify(outcome.body)),
  };
});

const tokens = (n: number) => ({ access_token: `access-${n}`, refresh_token: `refresh-${n}` });

function signedIn({ cachedUser = true } = {}) {
  mockStore.set("auth.accessToken", "access-0");
  mockStore.set("auth.refreshToken", "refresh-0");
  if (cachedUser) mockStore.set("auth.user", JSON.stringify(USER));
  useAuthStore.setState({ user: USER, accessToken: "access-0", status: "authenticated" });
}

const lastSessionEnd = () => {
  const raw = mockStore.get(LAST_SESSION_END_KEY);
  return raw ? (JSON.parse(raw) as { reason: string }).reason : undefined;
};

/** Runs `promise` while fast-forwarding the refresh backoff timers. */
async function settle<T>(promise: Promise<T>): Promise<T> {
  const result = promise.then(
    (value) => ({ value }),
    (error: unknown) => ({ error }),
  );
  await jest.runAllTimersAsync();
  const settled = await result;
  if ("error" in settled) throw settled.error;
  return settled.value;
}

beforeAll(() => {
  global.fetch = fetchMock as unknown as typeof fetch;
});

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  jest.spyOn(console, "warn").mockImplementation(() => {});
  mockStore.clear();
  calls.length = 0;
  for (const key of Object.keys(routes)) delete routes[key];
  useAuthStore.setState({ user: null, accessToken: null, status: "idle" });
});

afterEach(() => {
  jest.useRealTimers();
});

describe("request with an expired access token (apiFetch + refresh)", () => {
  it("refreshes and retries the original request with the new token", async () => {
    signedIn();
    script("/albums", { status: 401 }, { status: 200, body: ["ok"] });
    script("/auth/refresh", { status: 200, body: tokens(1) });

    await expect(settle(apiFetch("/albums"))).resolves.toEqual(["ok"]);

    expect(callsTo("/albums").map((call) => call.auth)).toEqual([
      "Bearer access-0",
      "Bearer access-1",
    ]);
    expect(mockStore.get("auth.refreshToken")).toBe("refresh-1");
  });

  it("ends the session when the API rejects the refresh token", async () => {
    signedIn();
    script("/albums", { status: 401 });
    script("/auth/refresh", { status: 401, body: { error: "AUTH_REFRESH_TOKEN_INVALID" } });

    const request = settle(apiFetch("/albums"));

    await expect(request).rejects.toBeInstanceOf(ApiError);
    await expect(request).rejects.toMatchObject({ status: 401 });
    expect(useAuthStore.getState().status).toBe("unauthenticated");
    expect(mockStore.has("auth.refreshToken")).toBe(false);
    expect(lastSessionEnd()).toBe("refresh_rejected");
    expect(showSessionExpiredToast).toHaveBeenCalledTimes(1);
  });

  it("keeps the session when the refresh can't reach the API, after retrying", async () => {
    signedIn();
    script("/albums", { status: 401 });
    script("/auth/refresh", "network", "network", "network");

    const request = settle(apiFetch("/albums"));

    await expect(request).rejects.toBeInstanceOf(SessionRefreshUnavailableError);
    const error = await request.catch((e: unknown) => e);
    expect(isNetworkError(error)).toBe(true);
    expect(callsTo("/auth/refresh")).toHaveLength(3);
    expect(useAuthStore.getState().status).toBe("authenticated");
    expect(mockStore.get("auth.refreshToken")).toBe("refresh-0");
    expect(showSessionExpiredToast).not.toHaveBeenCalled();
  });

  it("keeps the session on a server error during refresh", async () => {
    signedIn();
    script("/albums", { status: 401 });
    script("/auth/refresh", { status: 500 }, { status: 502 }, { status: 503 });

    await expect(settle(apiFetch("/albums"))).rejects.toBeInstanceOf(
      SessionRefreshUnavailableError,
    );
    expect(useAuthStore.getState().status).toBe("authenticated");
  });

  it("recovers when a retry succeeds after a 503, storing only the final token", async () => {
    signedIn();
    script("/albums", { status: 401 }, { status: 200, body: [] });
    script("/auth/refresh", { status: 503 }, { status: 200, body: tokens(2) });

    await settle(apiFetch("/albums"));

    expect(callsTo("/auth/refresh")).toHaveLength(2);
    // Retrying resends the same (not yet rotated on our side) refresh token.
    expect(callsTo("/auth/refresh").map((call) => call.body)).toEqual([
      { refresh_token: "refresh-0" },
      { refresh_token: "refresh-0" },
    ]);
    expect(mockStore.get("auth.refreshToken")).toBe("refresh-2");
  });

  it("retries a throttled (429) refresh", async () => {
    signedIn();
    script("/albums", { status: 401 }, { status: 200, body: [] });
    script("/auth/refresh", { status: 429 }, { status: 200, body: tokens(1) });

    await settle(apiFetch("/albums"));

    expect(callsTo("/auth/refresh")).toHaveLength(2);
    expect(useAuthStore.getState().status).toBe("authenticated");
  });

  it("does not retry a rejected (400) refresh, and ends the session", async () => {
    signedIn();
    script("/albums", { status: 401 });
    script("/auth/refresh", { status: 400 });

    await expect(settle(apiFetch("/albums"))).rejects.toMatchObject({ status: 401 });
    expect(callsTo("/auth/refresh")).toHaveLength(1);
    expect(useAuthStore.getState().status).toBe("unauthenticated");
  });

  it("keeps the session if persisting the new tokens fails", async () => {
    // Not a rejection: the API accepted the token. Ending the session here would log
    // the user out over a local storage hiccup.
    signedIn();
    script("/albums", { status: 401 });
    script("/auth/refresh", { status: 200, body: tokens(1) });
    const SecureStore = jest.requireMock<{ setItemAsync: jest.Mock }>("expo-secure-store");
    SecureStore.setItemAsync.mockRejectedValueOnce(new Error("keystore unavailable"));

    await expect(settle(apiFetch("/albums"))).rejects.toBeInstanceOf(
      SessionRefreshUnavailableError,
    );
    expect(useAuthStore.getState().status).toBe("authenticated");
  });

  it("shares one refresh between concurrent 401s", async () => {
    signedIn();
    script("/a", { status: 401 }, { status: 200, body: "a" });
    script("/b", { status: 401 }, { status: 200, body: "b" });
    script("/auth/refresh", { status: 200, body: tokens(1) });

    await expect(settle(Promise.all([apiFetch("/a"), apiFetch("/b")]))).resolves.toEqual([
      "a",
      "b",
    ]);
    expect(callsTo("/auth/refresh")).toHaveLength(1);
  });
});

describe("hydrate (app launch)", () => {
  function storedSession({ cachedUser = true } = {}) {
    mockStore.set("auth.accessToken", "access-0");
    mockStore.set("auth.refreshToken", "refresh-0");
    if (cachedUser) mockStore.set("auth.user", JSON.stringify(USER));
  }

  it("keeps the session when the access token expired and the refresh has no connectivity", async () => {
    // Regression: the original 401 used to bubble up and wipe the session.
    storedSession();
    script("/auth/me", { status: 401 });
    script("/auth/refresh", "network", "network", "network");

    await settle(useAuthStore.getState().hydrate());

    expect(useAuthStore.getState()).toMatchObject({ status: "authenticated", user: USER });
    expect(mockStore.get("auth.refreshToken")).toBe("refresh-0");
    expect(lastSessionEnd()).toBeUndefined();
  });

  it("keeps the session when /auth/me fails with a server error", async () => {
    storedSession();
    script("/auth/me", { status: 503 });

    await settle(useAuthStore.getState().hydrate());

    expect(useAuthStore.getState().status).toBe("authenticated");
  });

  it("ends the session when the API rejects the refresh", async () => {
    storedSession();
    script("/auth/me", { status: 401 });
    script("/auth/refresh", { status: 401 });

    await settle(useAuthStore.getState().hydrate());

    expect(useAuthStore.getState().status).toBe("unauthenticated");
    expect(mockStore.has("auth.accessToken")).toBe(false);
    expect(lastSessionEnd()).toBe("refresh_rejected");
  });

  it("ends the session when /auth/me itself is refused (user gone)", async () => {
    storedSession();
    script("/auth/me", { status: 404 });

    await settle(useAuthStore.getState().hydrate());

    expect(useAuthStore.getState().status).toBe("unauthenticated");
    expect(lastSessionEnd()).toBe("hydrate_rejected");
  });

  it("refreshes transparently and restores the fresh user", async () => {
    storedSession();
    script("/auth/me", { status: 401 }, { status: 200, body: USER });
    script("/auth/refresh", { status: 200, body: tokens(1) });

    await settle(useAuthStore.getState().hydrate());

    expect(useAuthStore.getState()).toMatchObject({
      status: "authenticated",
      accessToken: "access-1",
    });
  });

  it("without a cached user and no connectivity, shows login but keeps the tokens", async () => {
    storedSession({ cachedUser: false });
    script("/auth/me", "network");

    await settle(useAuthStore.getState().hydrate());

    expect(useAuthStore.getState().status).toBe("unauthenticated");
    expect(mockStore.get("auth.refreshToken")).toBe("refresh-0");
    expect(lastSessionEnd()).toBeUndefined();
  });

  it("goes straight to unauthenticated without stored tokens", async () => {
    await settle(useAuthStore.getState().hydrate());

    expect(useAuthStore.getState().status).toBe("unauthenticated");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("logout", () => {
  it("records a user logout without a toast and keeps the device id", async () => {
    signedIn();
    mockStore.set("device.id", "device-uuid");
    script("/auth/logout", { status: 200 });

    await settle(useAuthStore.getState().logout());

    expect(useAuthStore.getState().status).toBe("unauthenticated");
    expect(lastSessionEnd()).toBe("user_logout");
    expect(showSessionExpiredToast).not.toHaveBeenCalled();
    expect(mockStore.get("device.id")).toBe("device-uuid");
  });
});

describe("waitForPendingRefresh", () => {
  it("resolves immediately when no refresh is running", async () => {
    await expect(waitForPendingRefresh()).resolves.toBeUndefined();
  });

  it("waits for an in-flight refresh to store its tokens", async () => {
    signedIn();
    script("/albums", { status: 401 }, { status: 200, body: [] });
    script("/auth/refresh", { status: 503 }, { status: 200, body: tokens(1) });

    const request = apiFetch("/albums");
    await Promise.resolve();
    let waited = false;
    const waiting = waitForPendingRefresh().then(() => {
      waited = true;
    });

    await jest.advanceTimersByTimeAsync(0);
    expect(waited).toBe(false); // still backing off after the 503

    await jest.runAllTimersAsync();
    await waiting;
    expect(waited).toBe(true);
    expect(mockStore.get("auth.refreshToken")).toBe("refresh-1");
    await request;
  });

  it("does not reject when the refresh it waits for fails", async () => {
    signedIn();
    script("/albums", { status: 401 });
    script("/auth/refresh", { status: 401 });

    const request = apiFetch("/albums").catch(() => {});
    await Promise.resolve();
    await expect(settle(waitForPendingRefresh())).resolves.toBeUndefined();
    await request;
  });
});
