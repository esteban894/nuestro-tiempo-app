import { ApiError, NetworkError, type UploadProgressHandler } from "@/features/common/api/httpClient";

/** Backoff before the 2nd and 3rd attempt — i.e. at most 3 attempts per file. */
export const UPLOAD_RETRY_DELAYS_MS = [500, 1500] as const;

/**
 * Only transient failures are worth repeating: the connection dropped, storage is
 * overloaded (5xx / 503 SlowDown) or throttling (429). A 4xx is final — an expired POST
 * policy (403) or an oversized file (400 EntityTooLarge) will fail identically again.
 */
export function isRetryableUploadError(error: unknown): boolean {
  if (error instanceof NetworkError) return true;
  return error instanceof ApiError && (error.status >= 500 || error.status === 429);
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Runs one upload `attempt`, retrying transient failures with backoff. Progress is reset
 * to 0 at the start of every attempt, since a retry re-sends the whole file.
 */
export async function uploadWithRetry(
  attempt: (onProgress: UploadProgressHandler) => Promise<void>,
  {
    onProgress = () => {},
    delaysMs = UPLOAD_RETRY_DELAYS_MS,
    sleep = wait,
  }: {
    onProgress?: UploadProgressHandler;
    delaysMs?: readonly number[];
    sleep?: (ms: number) => Promise<void>;
  } = {},
): Promise<void> {
  for (let attemptIndex = 0; ; attemptIndex++) {
    onProgress(0);
    try {
      await attempt(onProgress);
      return;
    } catch (error) {
      if (attemptIndex >= delaysMs.length || !isRetryableUploadError(error)) throw error;
      await sleep(delaysMs[attemptIndex]);
    }
  }
}
