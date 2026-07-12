export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Thrown when the request never reached/completed against the server (no connectivity, DNS failure, timeout) — as opposed to `ApiError`, which means a response came back with a non-2xx status. */
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
  /** Called on a 401 from an authenticated request. Returns the new access token, or null if the session could not be refreshed. */
  onUnauthorized: () => Promise<string | null>;
};

let authAccessors: AuthAccessors | null = null;

export function configureApiAuth(accessors: AuthAccessors) {
  authAccessors = accessors;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL;

/**
 * Media endpoints (e.g. signed cover image URLs) come back as a path relative to the API,
 * not an absolute URL — prepend EXPO_PUBLIC_API_URL to build a URL the device can reach.
 */
export function resolveMediaUrl(path: string): string;
export function resolveMediaUrl(path: string | null | undefined): string | null;
export function resolveMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_URL ?? ""}${path}`;
}

/** React Native multipart file part shape (not a real Blob/File). */
export interface LocalFilePart {
  uri: string;
  name: string;
  type: string;
}

/**
 * Uploads a file directly to a presigned S3 URL (from POST /images/upload-urls or
 * /albums/cover/upload-url), bypassing this API entirely — no API_URL prefix, no auth
 * header, since S3 itself is the destination and the presigned fields are the credential.
 * `fields` must be appended before the file part, per S3's POST policy requirements.
 */
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
  /** Skip the 401 refresh-and-retry flow (used for public/auth endpoints). */
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
  if (!API_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not set. Add it to your .env file.");
  }

  const { body, skipAuthRetry, headers, ...rest } = options;
  const accessToken = authAccessors?.getAccessToken();
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: {
        // Let fetch set the multipart boundary itself for FormData bodies.
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
        "ngrok-skip-browser-warning": "true",
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
