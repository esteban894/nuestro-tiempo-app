import { apiFetch, NetworkError } from "../httpClient";

const originalFetch = global.fetch;
const originalTimeout = AbortSignal.timeout;

beforeEach(() => {
  // React Native's AbortSignal (the `abort-controller` polyfill) has no static timeout().
  // @ts-expect-error — removing it to mirror the device runtime.
  delete AbortSignal.timeout;
});

afterEach(() => {
  global.fetch = originalFetch;
  AbortSignal.timeout = originalTimeout;
  jest.useRealTimers();
});

it("sends the request without relying on AbortSignal.timeout", async () => {
  global.fetch = jest.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

  await expect(apiFetch("/auth/login", { method: "POST", body: {} })).resolves.toEqual({ ok: true });
  expect(global.fetch).toHaveBeenCalledTimes(1);
});

it("aborts a request that outlives the timeout as a NetworkError", async () => {
  jest.useFakeTimers();
  global.fetch = jest.fn(
    (_url: unknown, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new Error("aborted")));
      }),
  );

  const request = apiFetch("/auth/login", { method: "POST", body: {} });
  jest.advanceTimersByTime(15000);

  await expect(request).rejects.toBeInstanceOf(NetworkError);
});
