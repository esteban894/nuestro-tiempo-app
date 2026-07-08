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
    } catch {
      set({ couple: null });
    }
  },
}));
