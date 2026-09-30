import { DateTime, IANAZone } from "luxon";
import type { CalendarEvent } from "../api/calendar.api";

/**
 * The zone an event is anchored to: the one it was planned in, if valid. Undefined
 * means "this device's zone" (Luxon's local zone) — events predating per-event zones.
 */
export function resolveEventZone(event: Pick<CalendarEvent, "timeZone">): string | undefined {
  return event.timeZone && IANAZone.isValidZone(event.timeZone) ? event.timeZone : undefined;
}

/** `deviceZone` lets tests pin the device's zone; undefined is the real device zone. */
const inZone = (zone: string | undefined) => (zone ? { zone } : {});

/**
 * The "YYYY-MM-DD" day an event belongs to in the calendar views. A timed event sits on
 * the reader's local day (a 21:00 dinner in Buenos Aires is on the next day, 02:00, for a
 * reader in Madrid). An all-day event is a calendar date: it shows on the date it was
 * planned for, in any zone.
 */
export function eventDateKey(
  event: Pick<CalendarEvent, "startAt" | "allDay" | "timeZone">,
  deviceZone?: string,
): string {
  const zone = event.allDay ? (resolveEventZone(event) ?? deviceZone) : deviceZone;
  let start = DateTime.fromISO(event.startAt, inZone(zone));
  if (!start.isValid) start = DateTime.fromISO(event.startAt, inZone(deviceZone));
  return start.toFormat("yyyy-MM-dd");
}

/** An all-day event's date, spelled out in its own zone ("18 de septiembre de 2026"). */
export function formatAllDayDate(
  event: Pick<CalendarEvent, "startAt" | "allDay" | "timeZone">,
  locale: string,
  deviceZone?: string,
): string {
  const [year, month, day] = eventDateKey({ ...event, allDay: true }, deviceZone)
    .split("-")
    .map(Number);
  // Built at local noon from the zone's calendar date, so formatting it in the device's
  // zone can't shift the day.
  return new Date(year, month - 1, day, 12).toLocaleDateString(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * All-day events are stored at the device's midnight of the picked date. The picker
 * keeps whatever time the date happened to carry, so a date picked at 22:00 in Buenos
 * Aires would otherwise be stored as the next day in UTC.
 */
export function normalizeEventDates(
  startAt: Date,
  endAt: Date | null,
  allDay: boolean,
  deviceZone?: string,
): { startAt: Date; endAt: Date | null } {
  if (!allDay) return { startAt, endAt };
  const startOfDay = (date: Date) =>
    DateTime.fromJSDate(date, inZone(deviceZone)).startOf("day").toJSDate();
  return { startAt: startOfDay(startAt), endAt: endAt ? startOfDay(endAt) : null };
}
