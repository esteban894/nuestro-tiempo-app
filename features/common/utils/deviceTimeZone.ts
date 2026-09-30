import * as Localization from "expo-localization";

/** Same shape the API accepts: an IANA name, never a fixed offset like "-03:00". */
const IANA_NAME = /^[A-Za-z][A-Za-z0-9_+-]*(\/[A-Za-z0-9_+-]+)*$/;

function asIanaZone(value: string | null | undefined): string | null {
  return value && value.length <= 64 && IANA_NAME.test(value) ? value : null;
}

/**
 * The device's current IANA time zone (e.g. "America/Argentina/Buenos_Aires"), or null
 * if it can't be determined. Read fresh each time: it changes when the user travels.
 */
export function getDeviceTimeZone(): string | null {
  try {
    const fromLocalization = asIanaZone(Localization.getCalendars()[0]?.timeZone);
    if (fromLocalization) return fromLocalization;
  } catch {
    // Fall through to Intl.
  }
  try {
    return asIanaZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  } catch {
    return null;
  }
}
