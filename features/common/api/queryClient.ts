import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { showErrorToast } from "../components/ui/toast/showErrorToast";

/**
 * Queries/mutations that already render their error inline (e.g. via the `Input` component's
 * `error` prop) should set `meta: { suppressErrorToast: true }` so the same failure doesn't
 * also show up as a toast.
 */
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
