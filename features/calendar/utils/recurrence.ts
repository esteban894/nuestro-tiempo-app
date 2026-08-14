import { CalendarEvent } from "../api/calendar.api";

/**
 * A recurring event's startAt/endAt only records its first occurrence — the API stores
 * one row per event, not one per occurrence. Client-side calendar views must expand
 * yearly/monthly events into every occurrence that falls within the visible range
 * themselves, mirroring the `nextOccurrence` logic the API's reminder cron already uses
 * server-side (calendar.service.ts) but applied across a date range instead of a single
 * "next" lookup.
 */
export interface CalendarEventOccurrence extends CalendarEvent {
  /** Unique per occurrence — event.id repeats across occurrences, so use this for React keys. */
  occurrenceId: string;
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
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
 * Expands events into every occurrence overlapping [rangeStart, rangeEnd] (inclusive).
 * Non-recurring events pass through unchanged (still gain an `occurrenceId`).
 */
export function expandEventsInRange(
  events: CalendarEvent[],
  rangeStart: Date,
  rangeEnd: Date,
): CalendarEventOccurrence[] {
  const result: CalendarEventOccurrence[] = [];

  for (const event of events) {
    const anchor = new Date(event.startAt);

    if (event.recurrence === "none") {
      result.push({ ...event, occurrenceId: `${event.id}_${toDateKeyPart(anchor)}` });
      continue;
    }

    if (event.recurrence === "yearly") {
      const startYear = Math.max(anchor.getFullYear(), rangeStart.getFullYear());
      for (let year = startYear; year <= rangeEnd.getFullYear(); year++) {
        const candidate = new Date(anchor);
        candidate.setFullYear(year);
        if (candidate >= anchor && candidate >= rangeStart && candidate <= rangeEnd) {
          result.push(cloneEventAt(event, candidate));
        }
      }
      continue;
    }

    // monthly
    const anchorTotalMonths = anchor.getFullYear() * 12 + anchor.getMonth();
    const rangeStartTotalMonths = rangeStart.getFullYear() * 12 + rangeStart.getMonth();
    const rangeEndTotalMonths = rangeEnd.getFullYear() * 12 + rangeEnd.getMonth();
    const fromTotalMonths = Math.max(anchorTotalMonths, rangeStartTotalMonths);

    for (let total = fromTotalMonths; total <= rangeEndTotalMonths; total++) {
      const year = Math.floor(total / 12);
      const month = total % 12;
      const day = Math.min(anchor.getDate(), daysInMonth(year, month));
      const candidate = new Date(year, month, day, anchor.getHours(), anchor.getMinutes(), anchor.getSeconds());
      if (candidate >= anchor && candidate >= rangeStart && candidate <= rangeEnd) {
        result.push(cloneEventAt(event, candidate));
      }
    }
  }

  return result;
}
