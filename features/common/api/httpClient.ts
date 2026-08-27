import { env } from "../config/env";

export class ApiError extends Error {
  status: number;
  /** Stable domain error code from the API's `error` response field (e.g. "ALBUM_NOT_FOUND").
   *  Undefined for responses that don't carry one — including validation-pipe errors, whose
   *  `error` field holds an HTTP status name rather than a code (see extractErrorCode). */
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export class NetworkError extends Error {
  constructor(cause?: unknown) {
    // Internal/dev-facing message only — showErrorToast renders a translated
    // "errors.offlineMessage" instead of this string.
    super("Network request failed.");
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

const REQUEST_TIMEOUT_MS = 15000;

function extractErrorMessage(data: unknown, fallback: string): string {
  // Rate-limit responses aren't an object at all — the throttler serializes a bare JSON
  // string ("ThrottlerException: Too Many Requests").
  if (typeof data === "string") return data;
  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message: unknown }).message;
    if (Array.isArray(message)) return message.join(" ");
    if (typeof message === "string") return message;
  }
  return fallback;
}

// The API returns its application error code in the `error` field, e.g.
// { statusCode: 400, message: "...", error: "ALBUM_COUPLE_REQUIRED" }. Nest's built-in
// validation pipe instead reuses the field for the HTTP status name ("Bad Request"), which
// is not a stable code and must never be branched on — those are dropped here so
// ApiError.code always means "domain error code" and resolveApiErrorText can fall back to
// the status instead.
const GENERIC_STATUS_LABELS = new Set([
  "Bad Request",
  "Unauthorized",
  "Forbidden",
  "Not Found",
  "Conflict",
  "Payload Too Large",
  "Unsupported Media Type",
  "Too Many Requests",
  "Internal Server Error",
  "Not Implemented",
]);

function extractErrorCode(data: unknown): string | undefined {
  if (data && typeof data === "object" && "error" in data) {
    const code = (data as { error: unknown }).error;
    if (typeof code === "string" && !GENERIC_STATUS_LABELS.has(code)) return code;
  }
  return undefined;
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
      signal: rest.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
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
    throw new ApiError(
      response.status,
      extractErrorMessage(data, response.statusText),
      extractErrorCode(data),
    );
  }

  return data as T;
}
