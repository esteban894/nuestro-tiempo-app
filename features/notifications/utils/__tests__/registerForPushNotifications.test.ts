import { registerPushToken } from "../../api/notifications.api";
import { registerForPushNotifications } from "../registerForPushNotifications";

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
jest.mock("expo-device", () => ({ isDevice: true }));
jest.mock("expo-constants", () => ({ expoConfig: { extra: { eas: { projectId: "p" } } } }));
const mockRequestPermissions = jest.fn(async () => ({ status: "granted" }));
jest.mock("expo-notifications", () => ({
  setNotificationChannelAsync: jest.fn(async () => {}),
  AndroidImportance: { DEFAULT: 3 },
  getPermissionsAsync: jest.fn(async () => ({ status: "undetermined" })),
  requestPermissionsAsync: () => mockRequestPermissions(),
  getExpoPushTokenAsync: jest.fn(async () => ({ data: "ExponentPushToken[device]" })),
}));
let mockZone: string | null = "America/Argentina/Buenos_Aires";
jest.mock("@/features/common/utils/deviceTimeZone", () => ({
  getDeviceTimeZone: () => mockZone,
}));
jest.mock("../../api/notifications.api", () => ({
  registerPushToken: jest.fn(async () => {}),
  removePushToken: jest.fn(async () => {}),
}));

const register = registerPushToken as jest.Mock;

beforeEach(() => {
  mockStore.clear();
  register.mockClear();
  mockRequestPermissions.mockClear();
  mockZone = "America/Argentina/Buenos_Aires";
});

describe("registerForPushNotifications", () => {
  it("registers the token together with the device's zone", async () => {
    await registerForPushNotifications();

    expect(register).toHaveBeenCalledWith(
      "ExponentPushToken[device]",
      "America/Argentina/Buenos_Aires",
    );
  });

  it("does not re-register when neither the token nor the zone changed", async () => {
    await registerForPushNotifications();
    await registerForPushNotifications();

    expect(register).toHaveBeenCalledTimes(1);
  });

  it("re-registers when only the zone changed (the user traveled)", async () => {
    await registerForPushNotifications();
    mockZone = "Europe/Madrid";
    await registerForPushNotifications();

    expect(register).toHaveBeenCalledTimes(2);
    expect(register).toHaveBeenLastCalledWith("ExponentPushToken[device]", "Europe/Madrid");
  });

  it("re-registers once after updating from a build that stored the bare token", async () => {
    // Older builds stored just the token; the new key includes the zone.
    mockStore.set("lastRegisteredPushToken", "ExponentPushToken[device]");

    await registerForPushNotifications();

    expect(register).toHaveBeenCalledTimes(1);
  });

  it("still registers when the zone is unknown", async () => {
    mockZone = null;

    await registerForPushNotifications();

    expect(register).toHaveBeenCalledWith("ExponentPushToken[device]", null);
  });

  it("does not ask for permission on foreground re-checks", async () => {
    await registerForPushNotifications({ requestPermission: false });

    expect(mockRequestPermissions).not.toHaveBeenCalled();
    expect(register).not.toHaveBeenCalled(); // permission was never granted
  });

  it("retries on the next call if registering failed", async () => {
    register.mockRejectedValueOnce(new Error("offline"));

    await registerForPushNotifications();
    await registerForPushNotifications();

    expect(register).toHaveBeenCalledTimes(2);
  });
});
