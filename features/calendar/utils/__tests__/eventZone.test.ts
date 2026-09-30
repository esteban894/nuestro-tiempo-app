import { eventDateKey, formatAllDayDate, normalizeEventDates } from "../eventZone";

const BUENOS_AIRES = "America/Argentina/Buenos_Aires";
/** 18 sept, all day, planned in Buenos Aires: local midnight = 03:00 UTC. */
const ALL_DAY = { startAt: "2026-09-18T03:00:00.000Z", allDay: true, timeZone: BUENOS_AIRES };
/** 18 sept 21:00 in Buenos Aires = 19 sept 00:00 UTC. */
const DINNER = { startAt: "2026-09-19T00:00:00.000Z", allDay: false, timeZone: BUENOS_AIRES };

describe("eventDateKey", () => {
  it.each([BUENOS_AIRES, "Pacific/Honolulu", "Asia/Tokyo", "Europe/Madrid"])(
    "keeps an all-day event on its date for a device in %s",
    (zone) => {
      expect(eventDateKey(ALL_DAY, zone)).toBe("2026-09-18");
    },
  );

  it("places a timed event on the reader's local day", () => {
    expect(eventDateKey(DINNER, BUENOS_AIRES)).toBe("2026-09-18");
    expect(eventDateKey(DINNER, "Europe/Madrid")).toBe("2026-09-19");
  });

  it("uses the device zone for all-day events without a zone (older events)", () => {
    const legacy = { ...ALL_DAY, timeZone: null };
    expect(eventDateKey(legacy, BUENOS_AIRES)).toBe("2026-09-18");
    // ...and in another device zone, that device's calendar date for the instant.
    expect(eventDateKey(legacy, "Pacific/Honolulu")).toBe("2026-09-17");
  });

  it("ignores an unknown zone instead of crashing", () => {
    const broken = { ...ALL_DAY, timeZone: "Mars/Base" };
    expect(eventDateKey(broken, BUENOS_AIRES)).toBe("2026-09-18");
  });
});

describe("formatAllDayDate", () => {
  it.each(["Pacific/Honolulu", "Asia/Tokyo"])("spells the planned date for a device in %s", (zone) => {
    const text = formatAllDayDate(ALL_DAY, "es", zone);
    expect(text).toMatch(/18/);
    expect(text).toMatch(/septiembre/);
  });
});

describe("normalizeEventDates", () => {
  it("moves all-day dates to the device's midnight, whatever time the picker carried", () => {
    // Picked at 22:30 on the 18th in Buenos Aires — already the 19th in UTC.
    const picked = new Date("2026-09-19T01:30:00.000Z");
    const end = new Date("2026-09-21T02:59:00.000Z"); // 20th 23:59 ART

    const { startAt, endAt } = normalizeEventDates(picked, end, true, BUENOS_AIRES);

    expect(startAt.toISOString()).toBe("2026-09-18T03:00:00.000Z");
    expect(endAt?.toISOString()).toBe("2026-09-20T03:00:00.000Z");
  });

  it("uses the device's own midnight in other zones too", () => {
    const picked = new Date("2026-09-18T20:00:00.000Z"); // 18th 22:00 in Madrid

    expect(normalizeEventDates(picked, null, true, "Europe/Madrid").startAt.toISOString()).toBe(
      "2026-09-17T22:00:00.000Z",
    );
  });

  it("leaves timed events untouched", () => {
    const start = new Date("2026-09-19T00:00:00.000Z");
    expect(normalizeEventDates(start, null, false)).toEqual({ startAt: start, endAt: null });
  });

  it("does not mutate the dates it is given", () => {
    const picked = new Date("2026-09-19T01:30:00.000Z");
    const before = picked.getTime();
    normalizeEventDates(picked, null, true, BUENOS_AIRES);
    expect(picked.getTime()).toBe(before);
  });
});
