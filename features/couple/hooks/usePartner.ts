import { useAuthStore } from "@/features/auth";
import { CoupleUser } from "../api/couple.api";
import { useCoupleQuery } from "./useCoupleQuery";

/** The current user's partner in the couple, or null if there's no couple yet
 *  (or no partner has joined). */
export function usePartner(): CoupleUser | null {
  const currentUser = useAuthStore((state) => state.user);
  const { data: couple } = useCoupleQuery();

  if (!couple || !currentUser) return null;
  return couple.user1.id === currentUser.id ? couple.user2 : couple.user1;
}
