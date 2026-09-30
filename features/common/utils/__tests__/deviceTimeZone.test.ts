import * as Localization from "expo-localization";
import { getDeviceTimeZone } from "../deviceTimeZone";

jest.mock("expo-localization", () => ({ getCalendars: jest.fn() }));
const getCalendars = Localization.getCalendars as jest.Mock;

describe("getDeviceTimeZone", () => {
  it("reads the zone from expo-localization", () => {
    getCalendars.mockReturnValue([{ timeZone: "America/Argentina/Buenos_Aires" }]);
    expect(getDeviceTimeZone()).toBe("America/Argentina/Buenos_Aires");
  });

  it.each([
    ["no calendars", []],
    ["a null zone", [{ timeZone: null }]],
    ["a fixed offset (not an IANA zone)", [{ timeZone: "-03:00" }]],
  ])("falls back to Intl on %s", (_label, calendars) => {
    getCalendars.mockReturnValue(calendars);
    expect(getDeviceTimeZone()).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone);
  });

  it("falls back to Intl when expo-localization throws", () => {
    getCalendars.mockImplementation(() => {
      throw new Error("native module unavailable");
    });
    expect(getDeviceTimeZone()).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone);
  });

  it("returns null when nothing can tell", () => {
    getCalendars.mockReturnValue([]);
    const spy = jest.spyOn(Intl, "DateTimeFormat").mockImplementation(() => {
      throw new Error("no Intl");
    });
    try {
      expect(getDeviceTimeZone()).toBeNull();
    } finally {
      spy.mockRestore();
    }
  });
});
