import { apiFetch } from "@/features/common/api/httpClient";

export type CreateCouplePayload = { startDate: string };
export type CreateCoupleResponse = {
  coupleId: string;
  startDate: string;
  code: string;
  expiresAt: string;
  createdAt: string;
};

export type JoinCouplePayload = { code: string };
export type JoinCoupleResponse = {
  coupleId: string;
  startDate: string;
  createdAt: string;
};

export function createCouple(payload: CreateCouplePayload) {
  return apiFetch<CreateCoupleResponse>("/couples", { method: "POST", body: payload });
}

export function joinCouple(payload: JoinCouplePayload) {
  return apiFetch<JoinCoupleResponse>("/couples/join", { method: "POST", body: payload });
}

export type CoupleUser = { id: string; name: string };
export type CoupleResponse = {
  id: string;
  startDate: string;
  createdAt: string;
  user1: CoupleUser;
  user2: CoupleUser | null;
};

export function getMyCouple() {
  return apiFetch<CoupleResponse>("/couples/me");
}
