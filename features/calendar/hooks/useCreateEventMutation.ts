import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCalendarEvent } from "../api/calendar.api";
import { calendarKeys } from "../api/queryKeys";

export function useCreateEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCalendarEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
    },
    meta: { suppressErrorToast: true },
  });
}
