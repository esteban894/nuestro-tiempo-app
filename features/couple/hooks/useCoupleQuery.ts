import { ApiError } from "@/features/common";
import { useQuery } from "@tanstack/react-query";
import { getMyCouple, type CoupleResponse } from "../api/couple.api";
import { coupleKeys } from "../api/queryKeys";

async function fetchCoupleOrNull(): Promise<CoupleResponse | null> {
  try {
    return await getMyCouple();
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export function useCoupleQuery() {
  return useQuery({
    queryKey: coupleKeys.me(),
    queryFn: fetchCoupleOrNull,
    retry: false,
  });
}
