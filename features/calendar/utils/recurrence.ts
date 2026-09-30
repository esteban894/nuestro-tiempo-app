import { DateTime } from "luxon";
import { CalendarEvent } from "../api/calendar.api";
import { resolveEventZone } from "./eventZone";

/**
 * A recurring event's startAt/endAt only records its first occurrence — the API stores
 * one row per event, not one per occurrence. Client-side calendar views must expand
 * yearly/monthly events into every occurrence that falls within the visible range
 * themselves, with the same algorithm the API's reminder cron uses (see
 * `recurringOccurrences`) but applied across a date range instead of a single "next"
 * lookup.
 */
export interface CalendarEventOccurrence extends CalendarEvent {
  /** Unique per occurrence — event.id repeats across occurrences, so use this for React keys. */
  occurrenceId: string;
}

function toDateKeyPart(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function cloneEventAt(event: CalendarEvent, occurrenceStart: Date): CalendarEventOccurrence {
  const anchorStart = new Date(event.startAt);
  const anchorEnd = event.endAt ? new Date(event.endAt) : null;
  const durationMs = anchorEnd ? anchorEnd.getTime() - anchorStart.getTime() : null;
  const occurrenceEnd = durationMs !== null ? new Date(occurrenceStart.getTime() + durationMs) : null;

  return {
    ...event,
    startAt: occurrenceStart.toISOString(),
    endAt: occurrenceEnd ? occurrenceEnd.toISOString() : null,
    occurrenceId: `${event.id}_${toDateKeyPart(occurrenceStart)}`,
  };
}

/**
 * Occurrences of a recurring event within [rangeStart, rangeEnd], computed in the event's
 * zone like the API's reminder cron (`api/src/common/time/zoned-recurrence.ts`): each one
 * is `anchor + n months/years` from the anchor, keeping the wall-clock time in that zone
 * (DST-safe) and clamping to the last day of shorter months — so the 31st lands on the
 * 30th in April and Feb 29 on Feb 28 in non-leap years, exactly as the API does.
 */
function recurringOccurrences(
  event: CalendarEvent,
  rangeStart: Date,
  rangeEnd: Date,
  deviceZone: string | undefined,
): Date[] {
  const zone = resolveEventZone(event) ?? deviceZone;
  let anchor = DateTime.fromISO(event.startAt, zone ? { zone } : {});
  // A zone this runtime can't handle: fall back to the device's own zone.
  if (!anchor.isValid) anchor = DateTime.fromISO(event.startAt, deviceZone ? { zone: deviceZone } : {});

  const unit = event.recurrence === "yearly" ? "years" : "months";
  const from = DateTime.fromJSDate(rangeStart, { zone: anchor.zone });
  const elapsed =
    unit === "years"
      ? from.year - anchor.year
      : (from.year - anchor.year) * 12 + (from.month - anchor.month);

  const occurrences: Date[] = [];
  for (let n = Math.max(0, elapsed - 1); ; n++) {
    const candidate = anchor.plus({ [unit]: n }).toJSDate();
    if (candidate > rangeEnd) break;
    if (candidate >= rangeStart) occurrences.push(candidate);
  }
  return occurrences;
}

/**
 * Expands events into every occurrence overlapping [rangeStart, rangeEnd] (inclusive).
 * Non-recurring events pass through unchanged (still gain an `occurrenceId`).
 */
export function expandEventsInRange(
  events: CalendarEvent[],
  rangeStart: Date,
  rangeEnd: Date,
  /** Pins the device's zone (tests); undefined is the real device zone. */
  { deviceZone }: { deviceZone?: string } = {},
): CalendarEventOccurrence[] {
  const result: CalendarEventOccurrence[] = [];

  for (const event of events) {
    if (event.recurrence === "none") {
      result.push({ ...event, occurrenceId: `${event.id}_${toDateKeyPart(new Date(event.startAt))}` });
      continue;
    }

    for (const occurrence of recurringOccurrences(event, rangeStart, rangeEnd, deviceZone)) {
      result.push(cloneEventAt(event, occurrence));
    }
  }

  return result;
}
