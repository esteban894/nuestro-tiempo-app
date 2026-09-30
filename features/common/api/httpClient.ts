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

/** A request got a 401 and the session couldn't be refreshed for a transient reason
 *  (no connectivity, server error). The session was NOT rejected, so callers treat this
 *  like being offline — it is a NetworkError — and must not end the session over it. */
export class SessionRefreshUnavailableError extends NetworkError {
  constructor(cause?: unknown) {
    super(cause);
    this.name = "SessionRefreshUnavailableError";
  }
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

/** Failures worth retrying because they say nothing about the request itself: the
 *  connection dropped, the server errored (5xx), or it's throttling (429). */
export function isTransientError(error: unknown): boolean {
  if (error instanceof NetworkError) return true;
  return error instanceof ApiError && (error.status >= 500 || error.status === 429);
}

/** What happened when a 401 triggered a session refresh. Only `rejected` means the
 *  server refused the session; `unavailable` means it couldn't be asked. */
export type RefreshOutcome =
  | { status: "refreshed"; token: string }
  | { status: "rejected" }
  | { status: "unavailable"; cause: unknown };

type AuthAccessors = {
  getAccessToken: () => string | null;
  onUnauthorized: () => Promise<RefreshOutcome>;
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

/** Upload progress as a 0–1 fraction, or null while the total size is unknown. */
export type UploadProgressHandler = (fraction: number | null) => void;

/** A single photo on a slow link can legitimately take a while; this only catches stalls. */
const STORAGE_UPLOAD_TIMEOUT_MS = 120_000;

/**
 * POSTs a file straight to storage (presigned S3 POST). Uses XMLHttpRequest rather than
 * fetch because React Native's fetch exposes no upload progress.
 */
export function uploadToPresignedUrl(
  uploadUrl: string,
  fields: Record<string, string>,
  file: LocalFilePart,
  { onProgress }: { onProgress?: UploadProgressHandler } = {},
): Promise<void> {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
  formData.append("file", file as unknown as Blob);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", uploadUrl);
    xhr.timeout = STORAGE_UPLOAD_TIMEOUT_MS;

    if (xhr.upload) {
      xhr.upload.onprogress = (event) => {
        onProgress?.(
          event.lengthComputable && event.total > 0
            ? Math.min(Math.max(event.loaded / event.total, 0), 1)
            : null,
        );
      };
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(1);
        resolve();
      } else {
        reject(new ApiError(xhr.status, `Failed to upload file to storage (${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new NetworkError());
    xhr.ontimeout = () => reject(new NetworkError(new Error("Storage upload timed out")));
    xhr.onabort = () => reject(new NetworkError(new Error("Storage upload aborted")));

    xhr.send(formData);
  });
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

  // AbortSignal.timeout() doesn't exist in React Native (its AbortSignal comes from the
  // `abort-controller` polyfill), so the timeout is wired by hand.
  const timeoutController = rest.signal ? undefined : new AbortController();
  const timeoutId = timeoutController
    ? setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS)
    : undefined;

  let response: Response;
  try {
    response = await fetch(`${env.API_URL}${path}`, {
      ...rest,
      signal: rest.signal ?? timeoutController?.signal,
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
  } finally {
    clearTimeout(timeoutId);
  }

  if (response.status === 401 && !skipAuthRetry && authAccessors) {
    const outcome = await authAccessors.onUnauthorized();
    if (outcome.status === "refreshed") {
      return apiFetch<T>(path, { ...options, skipAuthRetry: true });
    }
    // Surfacing this request's own 401 here would read as "token rejected" to callers
    // (e.g. app launch), which would end a session the server never refused.
    if (outcome.status === "unavailable") {
      throw new SessionRefreshUnavailableError(outcome.cause);
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
