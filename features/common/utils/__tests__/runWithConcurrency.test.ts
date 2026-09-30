import { runWithConcurrency } from "../runWithConcurrency";

/** A promise the test resolves/rejects by hand, to control completion order. */
function deferred<T = void>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const flush = () => new Promise((resolve) => setImmediate(resolve));

describe("runWithConcurrency", () => {
  it("never has more than `limit` workers in flight", async () => {
    let inFlight = 0;
    let peak = 0;
    const gates = Array.from({ length: 10 }, () => deferred());

    const run = runWithConcurrency(gates, 4, async (gate) => {
      inFlight++;
      peak = Math.max(peak, inFlight);
      await gate.promise;
      inFlight--;
    });

    await flush();
    expect(inFlight).toBe(4);

    // Release out of order; a freed slot is refilled but never exceeds the limit.
    for (const index of [3, 0, 7, 1, 2, 5, 4, 9, 6, 8]) {
      gates[index].resolve();
      await flush();
    }
    await run;

    expect(peak).toBe(4);
  });

  it("returns settled results in input order regardless of completion order", async () => {
    const gates = [deferred<string>(), deferred<string>(), deferred<string>()];

    const run = runWithConcurrency(gates, 3, (gate) => gate.promise);
    gates[2].resolve("c");
    gates[0].reject(new Error("a failed"));
    gates[1].resolve("b");

    const results = await run;
    expect(results.map((r) => r.status)).toEqual(["rejected", "fulfilled", "fulfilled"]);
    expect(results[1]).toEqual({ status: "fulfilled", value: "b" });
    expect(results[2]).toEqual({ status: "fulfilled", value: "c" });
  });

  it("keeps processing the remaining items after a failure", async () => {
    const worker = jest.fn(async (n: number) => {
      if (n === 1) throw new Error("boom");
      return n * 10;
    });

    const results = await runWithConcurrency([0, 1, 2, 3], 1, worker);

    expect(worker).toHaveBeenCalledTimes(4);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(3);
  });

  it("captures a worker that throws synchronously as a rejection", async () => {
    const results = await runWithConcurrency([1], 2, () => {
      throw new Error("sync");
    });

    expect(results[0].status).toBe("rejected");
  });

  it("resolves to an empty list for no items without calling the worker", async () => {
    const worker = jest.fn();
    await expect(runWithConcurrency([], 4, worker)).resolves.toEqual([]);
    expect(worker).not.toHaveBeenCalled();
  });

  it("works when the limit exceeds the number of items", async () => {
    const results = await runWithConcurrency([1, 2], 10, async (n) => n);
    expect(results).toEqual([
      { status: "fulfilled", value: 1 },
      { status: "fulfilled", value: 2 },
    ]);
  });

  it.each([0, -1, NaN])("treats a non-positive limit (%p) as 1 instead of hanging", async (limit) => {
    const results = await runWithConcurrency([1, 2, 3], limit, async (n) => n);
    expect(results).toHaveLength(3);
  });

  it("passes the item index to the worker", async () => {
    const worker = jest.fn(async (_item: string, index: number) => index);
    await runWithConcurrency(["a", "b"], 2, worker);
    expect(worker).toHaveBeenCalledWith("a", 0);
    expect(worker).toHaveBeenCalledWith("b", 1);
  });
});
