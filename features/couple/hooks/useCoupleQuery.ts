import { ApiError } from "@/features/common";
import { useQuery } from "@tanstack/react-query";
import { getMyCouple, type CoupleResponse } from "../api/couple.api";
import { coupleKeys } from "../api/queryKeys";

async function fetchCoupleOrNull(): Promise<CoupleResponse | null> {
  try {
    return await getMyCouple();
  } catch (error) {
    // A 404 just means the user has no Couple yet — that's expected, not an error to report.
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/** Query for the current user's Couple (GET /couples/me), resolving to `null` when they have none. */
export function useCoupleQuery() {
  return useQuery({
    queryKey: coupleKeys.me(),
    queryFn: fetchCoupleOrNull,
    retry: false,
  });
}
