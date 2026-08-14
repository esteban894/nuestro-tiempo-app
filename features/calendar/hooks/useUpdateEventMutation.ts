import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarEventPayload, updateCalendarEvent } from "../api/calendar.api";
import { calendarKeys } from "../api/queryKeys";

export function useUpdateEventMutation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<CalendarEventPayload>) => updateCalendarEvent(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
    },
    meta: { suppressErrorToast: true },
  });
}
