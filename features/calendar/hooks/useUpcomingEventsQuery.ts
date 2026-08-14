import { useQuery } from "@tanstack/react-query";
import { getUpcomingCalendarEvents } from "../api/calendar.api";
import { calendarKeys } from "../api/queryKeys";

export function useUpcomingEventsQuery(limit = 5) {
  return useQuery({
    queryKey: calendarKeys.upcoming(),
    queryFn: () => getUpcomingCalendarEvents(limit),
  });
}
