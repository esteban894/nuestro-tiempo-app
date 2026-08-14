import { CalendarEventCategory } from "../api/calendar.api";

/** One color per category, used to tint events consistently across every calendar view. */
export const CATEGORY_COLOR: Record<CalendarEventCategory, string> = {
  anniversary: "#e6add8",
  birthday: "#f5c26b",
  date_plan: "#add8e6",
  milestone: "#d8e6ad",
  memory: "#c9b8f5",
  other: "#cfd8dc",
};
