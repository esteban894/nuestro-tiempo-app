import { buildQuery } from "@/features/common/api/buildQuery";
import { apiFetch } from "@/features/common/api/httpClient";

export type CalendarEventType = "appointment" | "important_date";
export type CalendarEventCategory =
  | "anniversary"
  | "birthday"
  | "date_plan"
  | "milestone"
  | "memory"
  | "other";
export type CalendarEventRecurrence = "none" | "yearly" | "monthly";
export type CalendarEventStatus = "proposed" | "confirmed" | "rejected";

export type CalendarEvent = {
  id: string;
  coupleId: string;
  createdBy: string | null;
  type: CalendarEventType;
  category: CalendarEventCategory;
  title: string;
  description: string | null;
  location: string | null;
  startAt: string;
  endAt: string | null;
  allDay: boolean;
  /** IANA zone the event was planned in; null for events predating per-event zones. */
  timeZone: string | null;
  recurrence: CalendarEventRecurrence;
  reminderMinutesBefore: number | null;
  status: CalendarEventStatus;
  proposedBy: string | null;
  respondedBy: string | null;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** An upcoming event plus the occurrence the countdown should aim at (differs from startAt for recurring events). */
export type UpcomingCalendarEvent = CalendarEvent & { nextOccurrence: string };

export type CalendarEventPayload = {
  type: CalendarEventType;
  category?: CalendarEventCategory;
  title: string;
  description?: string;
  location?: string;
  startAt: string;
  endAt?: string;
  allDay?: boolean;
  /** This device's zone. The API only applies it when the dates change. */
  timeZone?: string;
  recurrence?: CalendarEventRecurrence;
  reminderMinutesBefore?: number;
};

export type CalendarEventsQuery = {
  from?: string;
  to?: string;
  createdBy?: string;
};

export function getCalendarEvents(query: CalendarEventsQuery = {}) {
  return apiFetch<CalendarEvent[]>(`/calendar/events${buildQuery(query)}`);
}

export function getUpcomingCalendarEvents(limit = 5) {
  return apiFetch<UpcomingCalendarEvent[]>(`/calendar/events/upcoming${buildQuery({ limit })}`);
}

export function getCalendarEvent(id: string) {
  return apiFetch<CalendarEvent>(`/calendar/events/${id}`);
}

export function createCalendarEvent(payload: CalendarEventPayload) {
  return apiFetch<CalendarEvent>("/calendar/events", { method: "POST", body: payload });
}

export function updateCalendarEvent(id: string, payload: Partial<CalendarEventPayload>) {
  return apiFetch<CalendarEvent>(`/calendar/events/${id}`, { method: "PATCH", body: payload });
}

export function deleteCalendarEvent(id: string) {
  return apiFetch<void>(`/calendar/events/${id}`, { method: "DELETE" });
}

export function confirmCalendarEvent(id: string) {
  return apiFetch<CalendarEvent>(`/calendar/events/${id}/confirm`, { method: "PATCH" });
}

export function rejectCalendarEvent(id: string) {
  return apiFetch<CalendarEvent>(`/calendar/events/${id}/reject`, { method: "PATCH" });
}
