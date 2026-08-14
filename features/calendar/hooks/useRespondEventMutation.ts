import { useMutation, useQueryClient } from "@tanstack/react-query";
import { confirmCalendarEvent, rejectCalendarEvent } from "../api/calendar.api";
import { calendarKeys } from "../api/queryKeys";

export function useConfirmEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => confirmCalendarEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
    },
    meta: { suppressErrorToast: true },
  });
}

export function useRejectEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rejectCalendarEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
    },
    meta: { suppressErrorToast: true },
  });
}
