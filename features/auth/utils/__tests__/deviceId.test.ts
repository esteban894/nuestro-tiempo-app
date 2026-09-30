import { login, register } from "../../api/auth.api";
import { DEVICE_ID_KEY, getDeviceId, resetDeviceIdCacheForTests } from "../deviceId";

const mockStore = new Map<string, string>();
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async (key: string) => mockStore.get(key) ?? null),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    mockStore.set(key, value);
  }),
}));

let mockCounter = 0;
jest.mock("expo-crypto", () => ({
  randomUUID: jest.fn(() => `uuid-${++mockCounter}`),
}));

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
  mockStore.clear();
  mockCounter = 0;
  bodies.length = 0;
  resetDeviceIdCacheForTests();
});

describe("getDeviceId", () => {
  it("creates an id once, stores it, and reuses it", async () => {
    const first = await getDeviceId();
    const second = await getDeviceId();

    expect(first).toBe("uuid-1");
    expect(second).toBe("uuid-1");
    expect(mockStore.get(DEVICE_ID_KEY)).toBe("uuid-1");
  });

  it("reuses the stored id across app launches", async () => {
    mockStore.set(DEVICE_ID_KEY, "persisted-id");

    await expect(getDeviceId()).resolves.toBe("persisted-id");
  });

  it("returns the same id to concurrent callers", async () => {
    const ids = await Promise.all([getDeviceId(), getDeviceId(), getDeviceId()]);

    expect(new Set(ids).size).toBe(1);
    expect(mockCounter).toBe(1);
  });

  it("does not cache a storage failure", async () => {
    const SecureStore = jest.requireMock<{ getItemAsync: jest.Mock }>("expo-secure-store");
    SecureStore.getItemAsync.mockRejectedValueOnce(new Error("keystore busy"));

    await expect(getDeviceId()).rejects.toThrow("keystore busy");
    await expect(getDeviceId()).resolves.toBe("uuid-1");
  });

  it("is not a session key, so ending a session can't wipe it", () => {
    expect(DEVICE_ID_KEY.startsWith("auth.")).toBe(false);
  });
});

describe("login / register", () => {
  it("send the device id with the credentials", async () => {
    await login({ email: "a@b.test", password: "12345678" });
    await register({ name: "Ana", email: "a@b.test", password: "12345678" });

    expect(bodies).toEqual([
      { email: "a@b.test", password: "12345678", deviceId: "uuid-1" },
      { name: "Ana", email: "a@b.test", password: "12345678", deviceId: "uuid-1" },
    ]);
  });
});
