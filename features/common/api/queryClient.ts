import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { showErrorToast } from "../components/ui/toast/showErrorToast";
import { ApiError } from "./httpClient";

/** A 4xx is the server saying the request itself is wrong — repeating it verbatim can only
 *  fail again, and against the account-level rate limiter it actively burns attempts. Only
 *  transport failures and 5xx get the single retry. */
function retryUnlessClientError(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
  return failureCount < 1;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: retryUnlessClientError,
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
