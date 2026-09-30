import { DateTime } from "luxon";
import type { CalendarEvent } from "../../api/calendar.api";
import { expandEventsInRange } from "../recurrence";

const BUENOS_AIRES = "America/Argentina/Buenos_Aires";

function event(overrides: Partial<CalendarEvent>): CalendarEvent {
  return {
    id: "e1",
    coupleId: "c1",
    createdBy: "u1",
    type: "important_date",
    category: "anniversary",
    title: "Aniversario",
    description: null,
    location: null,
    startAt: "2026-01-19T00:00:00.000Z",
    endAt: null,
    allDay: false,
    timeZone: BUENOS_AIRES,
    recurrence: "monthly",
    reminderMinutesBefore: null,
    status: "confirmed",
    proposedBy: null,
    respondedBy: null,
    respondedAt: null,
    createdAt: "",
    updatedAt: "",
    ...overrides,
  };
}

const at = (iso: string, zone: string) => DateTime.fromISO(iso, { zone }).toJSDate();
const wall = (iso: string, zone: string) =>
  DateTime.fromISO(iso, { zone }).toFormat("yyyy-MM-dd HH:mm");

/** Wall-clock times (in `zone`) of every occurrence in [from, to]. */
function occurrences(e: CalendarEvent, from: string, to: string, zone = BUENOS_AIRES) {
  return expandEventsInRange([e], at(from, zone), at(to, zone)).map((o) => wall(o.startAt, zone));
}

describe("expandEventsInRange (same cases as the API's zoned-recurrence)", () => {
  it("keeps an evening monthly event on its local day", () => {
    // 18th 21:00 ART is the 19th in UTC.
    expect(occurrences(event({}), "2026-03-01T00:00", "2026-03-31T23:59")).toEqual([
      "2026-03-18 21:00",
    ]);
  });

  it("clamps a monthly event on the 31st to shorter months and returns to the 31st", () => {
    const e = event({ startAt: at("2026-01-31T21:00", BUENOS_AIRES).toISOString() });

    expect(occurrences(e, "2026-02-01T00:00", "2026-05-31T23:59")).toEqual([
      "2026-02-28 21:00",
      "2026-03-31 21:00",
      "2026-04-30 21:00",
      "2026-05-31 21:00",
    ]);
  });

  it("puts a yearly Feb 29 event on Feb 28 in non-leap years (not March 1)", () => {
    const e = event({
      recurrence: "yearly",
      startAt: at("2024-02-29T20:00", BUENOS_AIRES).toISOString(),
    });

    expect(occurrences(e, "2027-01-01T00:00", "2028-12-31T23:59")).toEqual([
      "2027-02-28 20:00",
      "2028-02-29 20:00",
    ]);
  });

  it("keeps the local time across DST changes (Europe/Madrid)", () => {
    const madrid = "Europe/Madrid";
    const e = event({ timeZone: madrid, startAt: at("2026-01-15T21:00", madrid).toISOString() });

    expect(occurrences(e, "2026-03-01T00:00", "2026-04-30T23:59", madrid)).toEqual([
      "2026-03-15 21:00", // winter, UTC+1
      "2026-04-15 21:00", // summer, UTC+2
    ]);
  });

  it("includes the anchor itself and nothing before it", () => {
    const e = event({ startAt: at("2026-03-18T21:00", BUENOS_AIRES).toISOString() });

    expect(occurrences(e, "2026-01-01T00:00", "2026-04-30T23:59")).toEqual([
      "2026-03-18 21:00",
      "2026-04-18 21:00",
    ]);
  });

  it("gives the same instants the API computes, whatever zone the device is in", () => {
    // A partner in Madrid sees the Buenos Aires anniversary at the same instants.
    const e = event({ startAt: at("2026-01-31T21:00", BUENOS_AIRES).toISOString() });
    const range = [new Date("2026-04-01T12:00:00Z"), new Date("2026-05-01T12:00:00Z")] as const;
    const startsFor = (deviceZone: string) =>
      expandEventsInRange([e], ...range, { deviceZone }).map((o) => o.startAt);

    expect(startsFor("Europe/Madrid")).toEqual(startsFor(BUENOS_AIRES));
    expect(startsFor("Pacific/Honolulu")).toEqual(startsFor(BUENOS_AIRES));
    // Apr 30 21:00 ART — the API's answer, not the UTC-clamped Apr 29.
    expect(startsFor("Europe/Madrid")).toEqual(["2026-05-01T00:00:00.000Z"]);
  });

  it("uses the device zone for events without one (older events)", () => {
    const e = event({ timeZone: null, startAt: at("2026-01-31T21:00", BUENOS_AIRES).toISOString() });

    const result = expandEventsInRange(
      [e],
      new Date("2026-04-01T12:00:00Z"),
      new Date("2026-05-01T12:00:00Z"),
      { deviceZone: BUENOS_AIRES },
    );

    expect(result.map((o) => o.startAt)).toEqual(["2026-05-01T00:00:00.000Z"]);
  });

  it("falls back to the device zone for a zone the runtime doesn't know", () => {
    const e = event({ timeZone: "Mars/Base", startAt: "2026-01-10T12:00:00.000Z" });

    const result = expandEventsInRange(
      [e],
      new Date("2026-02-01T00:00:00Z"),
      new Date("2026-02-28T00:00:00Z"),
      { deviceZone: "UTC" },
    );

    expect(result.map((o) => o.startAt)).toEqual(["2026-02-10T12:00:00.000Z"]);
  });

  it("passes one-off events through and keeps occurrence ids unique", () => {
    const oneOff = event({ id: "one", recurrence: "none" });
    const monthly = event({ id: "m" });

    const result = expandEventsInRange(
      [oneOff, monthly],
      at("2026-01-01T00:00", BUENOS_AIRES),
      at("2026-03-31T23:59", BUENOS_AIRES),
    );

    expect(result.filter((o) => o.id === "m")).toHaveLength(3);
    expect(new Set(result.map((o) => o.occurrenceId)).size).toBe(result.length);
  });
});
