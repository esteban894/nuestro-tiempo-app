import { ApiError, showErrorToast } from "@/features/common";
import { create } from "zustand";
import { getMyCouple } from "../api/couple.api";
import type { CoupleResponse } from "../api/couple.api";

type CoupleState = {
  couple: CoupleResponse | null;
  fetchCouple: () => Promise<void>;
};

export const useCoupleStore = create<CoupleState>((set) => ({
  couple: null,

  fetchCouple: async () => {
    try {
      const couple = await getMyCouple();
      set({ couple });
    } catch (error) {
      set({ couple: null });
      // A 404 just means the user has no Couple yet — that's expected, not an error to report.
      if (error instanceof ApiError && error.status === 404) return;
      showErrorToast(error);
    }
  },
}));
