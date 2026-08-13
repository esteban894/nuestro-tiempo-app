import { env } from "../config/env";

export class ApiError extends Error {
  status: number;
  /** Application error code from the API's `error` response field (e.g. "ALBUM_NOT_FOUND").
   *  Undefined for responses that don't carry one, like Nest's validation-pipe errors. */
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

function extractErrorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message: unknown }).message;
    if (Array.isArray(message)) return message.join(" ");
    if (typeof message === "string") return message;
  }
  return fallback;
}

// The API returns its application error code in the `error` field, e.g.
// { statusCode: 400, message: "...", error: "ALBUM_COUPLE_REQUIRED" }. Nest's built-in
// validation pipe instead sends `error: "Bad Request"`, which isn't one of our codes —
// showErrorToast falls back to a generic message when the code has no dictionary entry.
function extractErrorCode(data: unknown): string | undefined {
  if (data && typeof data === "object" && "error" in data) {
    const code = (data as { error: unknown }).error;
    if (typeof code === "string") return code;
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
