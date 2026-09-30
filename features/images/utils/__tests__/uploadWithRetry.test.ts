import { ApiError, NetworkError } from "@/features/common/api/httpClient";
import { isRetryableUploadError, uploadWithRetry } from "../uploadWithRetry";

const noSleep = jest.fn(() => Promise.resolve());

beforeEach(() => noSleep.mockClear());

describe("isRetryableUploadError", () => {
  it.each([
    ["network failure", new NetworkError(), true],
    ["503 SlowDown", new ApiError(503, "slow down"), true],
    ["500", new ApiError(500, "error"), true],
    ["429", new ApiError(429, "throttled"), true],
    ["403 expired policy", new ApiError(403, "expired"), false],
    ["400 EntityTooLarge", new ApiError(400, "too large"), false],
    ["404", new ApiError(404, "missing"), false],
    ["unknown error", new Error("?"), false],
  ])("%s → %p", (_label, error, expected) => {
    expect(isRetryableUploadError(error)).toBe(expected);
  });
});

describe("uploadWithRetry", () => {
  it("runs once when the first attempt succeeds", async () => {
    const attempt = jest.fn().mockResolvedValue(undefined);

    await uploadWithRetry(attempt, { sleep: noSleep });

    expect(attempt).toHaveBeenCalledTimes(1);
    expect(noSleep).not.toHaveBeenCalled();
  });

  it("retries a network error and succeeds on a later attempt", async () => {
    const attempt = jest
      .fn()
      .mockRejectedValueOnce(new NetworkError())
      .mockRejectedValueOnce(new ApiError(503, "slow down"))
      .mockResolvedValueOnce(undefined);

    await uploadWithRetry(attempt, { sleep: noSleep });

    expect(attempt).toHaveBeenCalledTimes(3);
    expect(noSleep.mock.calls).toEqual([[500], [1500]]);
  });

  it("gives up after the third attempt and throws the last error", async () => {
    const last = new NetworkError();
    const attempt = jest
      .fn()
      .mockRejectedValueOnce(new NetworkError())
      .mockRejectedValueOnce(new NetworkError())
      .mockRejectedValueOnce(last);

    await expect(uploadWithRetry(attempt, { sleep: noSleep })).rejects.toBe(last);
    expect(attempt).toHaveBeenCalledTimes(3);
  });

  it.each([403, 400])("does not retry a %i", async (status) => {
    const attempt = jest.fn().mockRejectedValue(new ApiError(status, "final"));

    await expect(uploadWithRetry(attempt, { sleep: noSleep })).rejects.toMatchObject({ status });
    expect(attempt).toHaveBeenCalledTimes(1);
    expect(noSleep).not.toHaveBeenCalled();
  });

  it("resets progress to 0 at the start of every attempt", async () => {
    const onProgress = jest.fn();
    const attempt = jest
      .fn()
      .mockImplementationOnce(async (report: (n: number) => void) => {
        report(0.6);
        throw new NetworkError();
      })
      .mockImplementationOnce(async (report: (n: number) => void) => {
        report(1);
      });

    await uploadWithRetry(attempt, { onProgress, sleep: noSleep });

    expect(onProgress.mock.calls.map(([p]) => p)).toEqual([0, 0.6, 0, 1]);
  });

  it("waits with the real timer by default", async () => {
    jest.useFakeTimers();
    try {
      const attempt = jest
        .fn()
        .mockRejectedValueOnce(new NetworkError())
        .mockResolvedValueOnce(undefined);

      const run = uploadWithRetry(attempt);
      await jest.advanceTimersByTimeAsync(499);
      expect(attempt).toHaveBeenCalledTimes(1);
      await jest.advanceTimersByTimeAsync(1);
      await run;
      expect(attempt).toHaveBeenCalledTimes(2);
    } finally {
      jest.useRealTimers();
    }
  });
});
