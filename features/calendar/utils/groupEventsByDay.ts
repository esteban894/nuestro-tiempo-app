import { CalendarEvent } from "../api/calendar.api";
import { toDateKey } from "./dateGrid";
import { eventDateKey } from "./eventZone";
import { CalendarEventOccurrence, expandEventsInRange } from "./recurrence";

export interface EventDayGroup {
  /** Local "YYYY-MM-DD" of the day the occurrences belong to. */
  dateKey: string;
  events: CalendarEventOccurrence[];
}

/**
 * The occurrences that fall on a day within [start, end], grouped per day in
 * chronological order (all-day first, then by time). `expandEventsInRange` lets
 * non-recurring events through regardless of the range, so the day key is what
 * actually scopes the result to the period.
 */
export function groupEventsByDay(
  events: CalendarEvent[],
  start: Date,
  end: Date,
  /** Pins the device's zone (tests); undefined is the real device zone. */
  { deviceZone }: { deviceZone?: string } = {},
): EventDayGroup[] {
  const firstKey = toDateKey(start);
  const lastKey = toDateKey(end);
  const byDay = new Map<string, CalendarEventOccurrence[]>();

  for (const occurrence of expandEventsInRange(events, start, end, { deviceZone })) {
    const key = eventDateKey(occurrence, deviceZone);
    if (key < firstKey || key > lastKey) continue;
    const list = byDay.get(key) ?? [];
    list.push(occurrence);
    byDay.set(key, list);
  }

  return [...byDay.keys()]
    .sort()
    .map((dateKey) => ({
      dateKey,
      events: byDay
        .get(dateKey)!
        .sort((a, b) => Number(b.allDay) - Number(a.allDay) || a.startAt.localeCompare(b.startAt)),
    }));
}
