import { CalendarEventCategory, CalendarEventType } from "../api/calendar.api";

// An appointment is something you schedule and do together; only date_plan
// (and the catch-all other) fit that. important_date entries are known facts
// to remember (birthdays, anniversaries), never something to "plan".
export const CATEGORIES_BY_TYPE: Record<CalendarEventType, CalendarEventCategory[]> = {
  appointment: ["date_plan", "other"],
  important_date: ["anniversary", "birthday", "milestone", "memory", "other"],
};
