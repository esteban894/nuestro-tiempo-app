import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCalendarEvent } from "../api/calendar.api";
import { calendarKeys } from "../api/queryKeys";

export function useDeleteEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCalendarEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
    },
  });
}
