import { CalendarEventsQuery } from "./calendar.api";

export const calendarKeys = {
  all: ["calendar"] as const,
  list: (query: CalendarEventsQuery = {}) => ["calendar", "list", query] as const,
  upcoming: () => ["calendar", "upcoming"] as const,
  detail: (id: string) => ["calendar", "detail", id] as const,
};
