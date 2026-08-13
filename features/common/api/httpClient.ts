import { env } from "../config/env";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export class NetworkError extends Error {
  constructor(cause?: unknown) {
    super("No se pudo conectar. Revisa tu conexión.");
    this.name = "NetworkError";
    this.cause = cause;
  }
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

type AuthAccessors = {
  getAccessToken: () => string | null;
  onUnauthorized: () => Promise<string | null>;
};

let authAccessors: AuthAccessors | null = null;

export function configureApiAuth(accessors: AuthAccessors) {
  authAccessors = accessors;
}

export function resolveMediaUrl(path: string): string;
export function resolveMediaUrl(path: string | null | undefined): string | null;
export function resolveMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${env.API_URL}${path}`;
}

export interface LocalFilePart {
  uri: string;
  name: string;
  type: string;
}

export async function uploadToPresignedUrl(
  uploadUrl: string,
  fields: Record<string, string>,
  file: LocalFilePart,
): Promise<void> {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
  formData.append("file", file as unknown as Blob);

  let response: Response;
  try {
    response = await fetch(uploadUrl, { method: "POST", body: formData });
  } catch (error) {
    throw new NetworkError(error);
  }
  if (!response.ok) {
    throw new ApiError(response.status, `Failed to upload file to storage (${response.status})`);
  }
}

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  skipAuthRetry?: boolean;
};

function extractErrorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message: unknown }).message;
    if (Array.isArray(message)) return message.join(" ");
    if (typeof message === "string") return message;
  }
  return fallback;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, skipAuthRetry, headers, ...rest } = options;
  const accessToken = authAccessors?.getAccessToken();
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  let response: Response;
  try {
    response = await fetch(`${env.API_URL}${path}`, {
      ...rest,
      headers: {
        // Let fetch set the multipart boundary itself for FormData bodies.
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
      body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new NetworkError(error);
  }

  if (response.status === 401 && !skipAuthRetry && authAccessors) {
    const newAccessToken = await authAccessors.onUnauthorized();
    if (newAccessToken) {
      return apiFetch<T>(path, { ...options, skipAuthRetry: true });
    }
  }

  const data = await parseResponseBody(response);

  if (!response.ok) {
    throw new ApiError(response.status, extractErrorMessage(data, response.statusText));
  }

  return data as T;
}
