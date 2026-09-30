import { getStoredValue, setStoredValue } from "@/features/common/utils/crossPlatformStorage";
import { randomUUID } from "expo-crypto";

/** Deliberately NOT one of the session keys: it must survive logout, so logging back in
 *  on this device replaces this device's previous session and nobody else's. */
export const DEVICE_ID_KEY = "device.id";

let cached: Promise<string> | null = null;

/**
 * Stable, random id for this app install. The API keeps one session per device id, so
 * signing in on another phone (or a dev build) no longer signs this one out. It's an
 * identifier, not a secret; a reinstall simply yields a new one.
 */
export function getDeviceId(): Promise<string> {
  cached ??= (async () => {
    const existing = await getStoredValue(DEVICE_ID_KEY);
    if (existing) return existing;
    const created = randomUUID();
    await setStoredValue(DEVICE_ID_KEY, created);
    return created;
  })().catch((error) => {
    // Don't cache a failure: the next login should try again.
    cached = null;
    throw error;
  });
  return cached;
}

/** Test hook: forget the in-memory copy so the next call re-reads storage. */
export function resetDeviceIdCacheForTests() {
  cached = null;
}
