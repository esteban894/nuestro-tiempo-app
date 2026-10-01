import type { CalendarViewMode } from "../components/view-switcher/ViewSwitcher";

/** Local "YYYY-MM-DD" key for a date — avoids UTC/timezone drift from toISOString(). */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Returns a 6x7 grid of dates covering the month `date` belongs to. */
export function getMonthGrid(date: Date): Date[] {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = startOfWeek(first);
  const grid: Date[] = [];
  for (let i = 0; i < 42; i++) {
    grid.push(addDays(start, i));
  }
  return grid;
}

/** Returns the 7 dates of the week that `date` belongs to. */
export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** First and last instant (local) of the month, week or day `anchor` belongs to. */
export function getPeriodRange(
  mode: CalendarViewMode,
  anchor: Date,
): { start: Date; end: Date } {
  let start: Date;
  let end: Date;
  if (mode === "month") {
    start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
  } else if (mode === "week") {
    start = startOfWeek(anchor);
    end = addDays(start, 6);
  } else {
    start = new Date(anchor);
    end = new Date(anchor);
  }
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export function minutesFromMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/** Locale-aware short weekday names (Sun..Sat), via Intl — no hardcoded arrays to translate. */
export function getWeekdayShortNames(locale: string): string[] {
  const sunday = new Date(2023, 0, 1); // a known Sunday
  const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
  return Array.from({ length: 7 }, (_, i) => formatter.format(addDays(sunday, i)));
}

/** Locale-aware hour label ("9 AM" in en, "9:00" in es) for grid time columns. */
export function formatHourLabel(hour: number, locale: string): string {
  return new Date(1970, 0, 1, hour).toLocaleTimeString(locale, { hour: "numeric" });
}
