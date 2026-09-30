import { getStoredValue, setStoredValue } from "@/features/common/utils/crossPlatformStorage";

/** Deliberately NOT one of the session keys: it must survive logout, so logging back in
 *  on this device replaces this device's previous session and nobody else's. */
export const DEVICE_ID_KEY = "device.id";

let cached: Promise<string> | null = null;

/**
 * RFC 4122 version-4 UUID, generated in plain JS on purpose: a native crypto module would
 * change the app's runtime fingerprint and keep this fix from shipping as an OTA update.
 * The device id is an identifier the API always scopes to a user, not a secret, so it
 * needs uniqueness rather than cryptographic randomness. `crypto.getRandomValues` is
 * used when the runtime provides it; `Math.random` is the fallback.
 */
export function generateUuidV4(): string {
  const bytes = new Uint8Array(16);
  const webCrypto = (globalThis as { crypto?: { getRandomValues?: (a: Uint8Array) => Uint8Array } })
    .crypto;
  if (typeof webCrypto?.getRandomValues === "function") {
    webCrypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Stable, random id for this app install. The API keeps one session per device id, so
 * signing in on another phone (or a dev build) no longer signs this one out. It's an
 * identifier, not a secret; a reinstall simply yields a new one.
 */
export function getDeviceId(): Promise<string> {
  cached ??= (async () => {
    const existing = await getStoredValue(DEVICE_ID_KEY);
    if (existing) return existing;
    const created = generateUuidV4();
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
