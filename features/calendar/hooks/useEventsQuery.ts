import { useQuery } from "@tanstack/react-query";
import { CalendarEventsQuery, getCalendarEvents } from "../api/calendar.api";
import { calendarKeys } from "../api/queryKeys";

export function useEventsQuery(query: CalendarEventsQuery = {}) {
  return useQuery({
    queryKey: calendarKeys.list(query),
    queryFn: () => getCalendarEvents(query),
  });
}
