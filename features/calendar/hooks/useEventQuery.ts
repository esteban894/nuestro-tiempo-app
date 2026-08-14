import { useQuery } from "@tanstack/react-query";
import { getCalendarEvent } from "../api/calendar.api";
import { calendarKeys } from "../api/queryKeys";

export function useEventQuery(id: string) {
  return useQuery({
    queryKey: calendarKeys.detail(id),
    queryFn: () => getCalendarEvent(id),
  });
}
