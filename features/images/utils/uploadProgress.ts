export type FileUploadStatus = "pending" | "uploading" | "done" | "failed";

export interface FileUploadState {
  status: FileUploadStatus;
  /** 0–1, or null while the upload size is unknown (indeterminate). */
  progress: number | null;
}

/** Progress steps smaller than this aren't worth a re-render. */
const PROGRESS_EMIT_STEP = 0.05;

/**
 * Tracks per-file upload state for a batch and emits snapshots to `onChange`.
 *
 * XHR progress events can fire dozens of times per second per file; with 4 uploads in
 * flight, re-rendering on each would flood the UI thread. Snapshots are emitted only when
 * a file's status changes, its progress moves by at least 5%, or it switches between
 * known and indeterminate.
 */
export function createUploadProgressTracker(
  count: number,
  onChange: (states: FileUploadState[]) => void,
) {
  const states: FileUploadState[] = Array.from({ length: count }, () => ({
    status: "pending",
    progress: 0,
  }));
  const emit = () => onChange(states.map((state) => ({ ...state })));

  const set = (index: number, next: FileUploadState) => {
    if (index < 0 || index >= states.length) return;
    states[index] = next;
    emit();
  };

  return {
    snapshot: () => states.map((state) => ({ ...state })),
    progress(index: number, fraction: number | null) {
      const current = states[index];
      if (!current || current.status === "done" || current.status === "failed") return;

      const progress = fraction === null ? null : Math.min(Math.max(fraction, 0), 1);
      const statusChanged = current.status !== "uploading";
      const determinacyChanged = (progress === null) !== (current.progress === null);
      const movedEnough =
        progress !== null &&
        current.progress !== null &&
        (Math.abs(progress - current.progress) >= PROGRESS_EMIT_STEP ||
          // Always report a reset to 0 (retry) and a jump to full.
          (progress === 0 && current.progress !== 0) ||
          (progress === 1 && current.progress !== 1));

      // Skipped updates are dropped on purpose: steps are measured from the last emitted
      // value, so slow steady progress still surfaces every 5%.
      if (statusChanged || determinacyChanged || movedEnough) {
        set(index, { status: "uploading", progress });
      }
    },
    done(index: number) {
      set(index, { status: "done", progress: 1 });
    },
    fail(index: number) {
      set(index, { status: "failed", progress: states[index]?.progress ?? 0 });
    },
  };
}
