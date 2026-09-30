import { login, register } from "../../api/auth.api";
import { DEVICE_ID_KEY, generateUuidV4, getDeviceId, resetDeviceIdCacheForTests } from "../deviceId";

const mockStore = new Map<string, string>();
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async (key: string) => mockStore.get(key) ?? null),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    mockStore.set(key, value);
  }),
}));

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const bodies: unknown[] = [];
beforeAll(() => {
  global.fetch = jest.fn(async (_url: string, init: RequestInit = {}) => {
    bodies.push(JSON.parse(init.body as string));
    return {
      status: 200,
      ok: true,
      statusText: "OK",
      text: async () => JSON.stringify({ user: {}, access_token: "a", refresh_token: "r" }),
    };
  }) as unknown as typeof fetch;
});

beforeEach(() => {
  jest.clearAllMocks();
  mockStore.clear();
  bodies.length = 0;
  resetDeviceIdCacheForTests();
});

describe("generateUuidV4", () => {
  it("produces RFC 4122 version-4 UUIDs (what the API's @IsUUID accepts)", () => {
    for (let i = 0; i < 200; i++) expect(generateUuidV4()).toMatch(UUID_V4);
  });

  it("does not repeat across many calls", () => {
    const ids = new Set(Array.from({ length: 5_000 }, generateUuidV4));
    expect(ids.size).toBe(5_000);
  });

  it("falls back to Math.random when the runtime has no crypto.getRandomValues", () => {
    const original = globalThis.crypto;
    Object.defineProperty(globalThis, "crypto", { value: undefined, configurable: true });
    try {
      expect(generateUuidV4()).toMatch(UUID_V4);
    } finally {
      Object.defineProperty(globalThis, "crypto", { value: original, configurable: true });
    }
  });
});

describe("getDeviceId", () => {
  it("creates an id once, stores it, and reuses it", async () => {
    const first = await getDeviceId();
    const second = await getDeviceId();

    expect(first).toMatch(UUID_V4);
    expect(second).toBe(first);
    expect(mockStore.get(DEVICE_ID_KEY)).toBe(first);
  });

  it("reuses the stored id across app launches", async () => {
    mockStore.set(DEVICE_ID_KEY, "persisted-id");

    await expect(getDeviceId()).resolves.toBe("persisted-id");
  });

  it("returns the same id to concurrent callers", async () => {
    const ids = await Promise.all([getDeviceId(), getDeviceId(), getDeviceId()]);

    expect(new Set(ids).size).toBe(1);
    const SecureStore = jest.requireMock<{ setItemAsync: jest.Mock }>("expo-secure-store");
    expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(1);
  });

  it("does not cache a storage failure", async () => {
    const SecureStore = jest.requireMock<{ getItemAsync: jest.Mock }>("expo-secure-store");
    SecureStore.getItemAsync.mockRejectedValueOnce(new Error("keystore busy"));

    await expect(getDeviceId()).rejects.toThrow("keystore busy");
    await expect(getDeviceId()).resolves.toMatch(UUID_V4);
  });

  it("is not a session key, so ending a session can't wipe it", () => {
    expect(DEVICE_ID_KEY.startsWith("auth.")).toBe(false);
  });
});

describe("login / register", () => {
  it("send the device id with the credentials", async () => {
    await login({ email: "a@b.test", password: "12345678" });
    await register({ name: "Ana", email: "a@b.test", password: "12345678" });

    const deviceId = await getDeviceId();
    expect(bodies).toEqual([
      { email: "a@b.test", password: "12345678", deviceId },
      { name: "Ana", email: "a@b.test", password: "12345678", deviceId },
    ]);
  });
});
