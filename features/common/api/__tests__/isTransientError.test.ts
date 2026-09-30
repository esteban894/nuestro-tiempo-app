import {
  ApiError,
  isNetworkError,
  isTransientError,
  NetworkError,
  SessionRefreshUnavailableError,
} from "../httpClient";

describe("isTransientError", () => {
  it.each([
    ["a dropped connection", new NetworkError(), true],
    ["an unavailable session refresh", new SessionRefreshUnavailableError(), true],
    ["500", new ApiError(500, "boom"), true],
    ["503", new ApiError(503, "unavailable"), true],
    ["429 throttling", new ApiError(429, "slow down"), true],
    ["400", new ApiError(400, "bad"), false],
    ["401", new ApiError(401, "unauthorized"), false],
    ["404", new ApiError(404, "missing"), false],
    ["a plain Error", new Error("?"), false],
    ["undefined", undefined, false],
  ])("%s → %p", (_label, error, expected) => {
    expect(isTransientError(error)).toBe(expected);
  });
});

describe("SessionRefreshUnavailableError", () => {
  it("is a NetworkError, so every offline code path handles it", () => {
    const error = new SessionRefreshUnavailableError(new Error("cause"));

    expect(isNetworkError(error)).toBe(true);
    expect(error.name).toBe("SessionRefreshUnavailableError");
    expect(error.cause).toEqual(new Error("cause"));
  });
});
