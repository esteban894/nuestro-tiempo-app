import { apiFetch } from "@/features/common/api/httpClient";

export type UserInfo = {
  id: string;
  name: string;
  email: string;
};

export type AuthResponse = {
  user: UserInfo;
  access_token: string;
  refresh_token: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export function login(payload: LoginPayload) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: payload,
    skipAuthRetry: true,
  });
}

export function register(payload: RegisterPayload) {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: payload,
    skipAuthRetry: true,
  });
}

export function refreshAccessToken(refreshToken: string) {
  return apiFetch<{ access_token: string }>("/auth/refresh", {
    method: "POST",
    body: { refresh_token: refreshToken },
    skipAuthRetry: true,
  });
}

export function logout() {
  return apiFetch<void>("/auth/logout", {
    method: "POST",
    skipAuthRetry: true,
  });
}

export function me() {
  return apiFetch<UserInfo>("/auth/me");
}
