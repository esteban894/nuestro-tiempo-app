import { createUploadProgressTracker, type FileUploadState } from "../uploadProgress";

function setup(count = 2) {
  const emitted: FileUploadState[][] = [];
  const tracker = createUploadProgressTracker(count, (states) => emitted.push(states));
  return { tracker, emitted, last: () => emitted[emitted.length - 1] };
}

describe("createUploadProgressTracker", () => {
  it("starts every file as pending at 0", () => {
    const { tracker } = setup(3);
    expect(tracker.snapshot()).toEqual([
      { status: "pending", progress: 0 },
      { status: "pending", progress: 0 },
      { status: "pending", progress: 0 },
    ]);
  });

  it("tracks each file independently", () => {
    const { tracker, last } = setup(2);
    tracker.progress(0, 0.5);
    tracker.done(1);

    expect(last()).toEqual([
      { status: "uploading", progress: 0.5 },
      { status: "done", progress: 1 },
    ]);
  });

  it("emits on the first progress event (status change)", () => {
    const { tracker, emitted } = setup(1);
    tracker.progress(0, 0.01);
    expect(emitted).toHaveLength(1);
  });

  it("drops progress steps under 5% but emits once they add up", () => {
    const { tracker, emitted } = setup(1);
    tracker.progress(0, 0.1);
    tracker.progress(0, 0.12);
    tracker.progress(0, 0.14);
    expect(emitted).toHaveLength(1);

    tracker.progress(0, 0.16);
    expect(emitted).toHaveLength(2);
    expect(emitted[1][0].progress).toBe(0.16);
  });

  it("always emits a reset to 0 (a retry) and a jump to 1", () => {
    const { tracker, emitted } = setup(1);
    tracker.progress(0, 0.02);
    tracker.progress(0, 0);
    tracker.progress(0, 0.98);
    tracker.progress(0, 1);

    expect(emitted.map((states) => states[0].progress)).toEqual([0.02, 0, 0.98, 1]);
  });

  it("emits when switching between known and indeterminate progress", () => {
    const { tracker, emitted } = setup(1);
    tracker.progress(0, 0.3);
    tracker.progress(0, null);
    tracker.progress(0, null);
    tracker.progress(0, 0.31);

    expect(emitted.map((states) => states[0].progress)).toEqual([0.3, null, 0.31]);
  });

  it("clamps out-of-range fractions", () => {
    const { tracker, last } = setup(1);
    tracker.progress(0, 1.7);
    expect(last()[0].progress).toBe(1);
  });

  it("ignores late progress events after a file finished or failed", () => {
    const { tracker, emitted } = setup(2);
    tracker.done(0);
    tracker.fail(1);
    const before = emitted.length;

    tracker.progress(0, 0.5);
    tracker.progress(1, 0.5);

    expect(emitted).toHaveLength(before);
    expect(tracker.snapshot()).toEqual([
      { status: "done", progress: 1 },
      { status: "failed", progress: 0 },
    ]);
  });

  it("ignores indexes outside the batch", () => {
    const { tracker, emitted } = setup(1);
    tracker.progress(5, 0.5);
    tracker.done(-1);
    expect(emitted).toHaveLength(0);
  });

  it("hands out copies so consumers can't mutate the tracker's state", () => {
    const { tracker, last } = setup(1);
    tracker.progress(0, 0.5);
    last()[0].progress = 0.9;
    expect(tracker.snapshot()[0].progress).toBe(0.5);
  });
});
