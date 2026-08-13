import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { showErrorToast } from "../components/ui/toast/showErrorToast";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.suppressErrorToast) return;
      showErrorToast(error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.suppressErrorToast) return;
      showErrorToast(error);
    },
  }),
});
