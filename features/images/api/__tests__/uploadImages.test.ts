import { ApiError, apiFetch, NetworkError, uploadToPresignedUrl } from "@/features/common/api/httpClient";
import { UploadFailedError, uploadImages } from "../image.api";
import type { FileUploadState } from "../../utils/uploadProgress";

jest.mock("@/features/common/api/httpClient", () => ({
  ...jest.requireActual("@/features/common/api/httpClient"),
  apiFetch: jest.fn(),
  uploadToPresignedUrl: jest.fn(),
}));

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;
const mockUpload = uploadToPresignedUrl as jest.MockedFunction<typeof uploadToPresignedUrl>;

const ALBUM_ID = "album-1";
const files = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    uri: `file:///p${i}.jpg`,
    name: `p${i}.jpg`,
    type: "image/jpeg",
  }));

/** Routes the two API calls; `confirm` decides what the server confirms. */
function mockApi({
  confirm = (keys: string[]) => keys,
}: { confirm?: (keys: string[]) => string[] } = {}) {
  mockApiFetch.mockImplementation(async (path, options) => {
    const body = options?.body as { files?: { filename: string }[]; keys?: string[] };
    if (path === "/images/upload-urls") {
      return {
        albumId: ALBUM_ID,
        uploads: body.files!.map((_, i) => ({
          key: `pending/${ALBUM_ID}/k${i}.jpg`,
          uploadUrl: `https://s3.test/${i}`,
          fields: {},
          expiresAt: "",
        })),
      } as never;
    }
    if (path === "/images/confirm") {
      return confirm(body.keys!).map((key) => ({ id: `id-${key}`, url: `https://cdn/${key}` })) as never;
    }
    throw new Error(`unexpected call ${path}`);
  });
}

const confirmCall = () => mockApiFetch.mock.calls.find(([path]) => path === "/images/confirm");
const confirmedKeys = () => (confirmCall()?.[1]?.body as { keys: string[] } | undefined)?.keys;

/** Fails the upload to the given S3 URL indexes with `error`. */
function failUploadsAt(indexes: number[], error: unknown = new ApiError(403, "denied")) {
  mockUpload.mockImplementation(async (url) => {
    const index = Number(url.split("/").pop());
    if (indexes.includes(index)) throw error;
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUpload.mockResolvedValue(undefined);
});

describe("uploadImages", () => {
  it("confirms every file when all uploads succeed", async () => {
    mockApi();

    const result = await uploadImages(ALBUM_ID, files(3));

    expect(confirmedKeys()).toEqual([
      `pending/${ALBUM_ID}/k0.jpg`,
      `pending/${ALBUM_ID}/k1.jpg`,
      `pending/${ALBUM_ID}/k2.jpg`,
    ]);
    expect(result.failedCount).toBe(0);
    expect(result.images).toHaveLength(3);
  });

  it("confirms only the uploads that succeeded and counts the rest as failed", async () => {
    mockApi();
    failUploadsAt([1, 3]);

    const result = await uploadImages(ALBUM_ID, files(5));

    expect(confirmedKeys()).toEqual([
      `pending/${ALBUM_ID}/k0.jpg`,
      `pending/${ALBUM_ID}/k2.jpg`,
      `pending/${ALBUM_ID}/k4.jpg`,
    ]);
    expect(result.failedCount).toBe(2);
    expect(result.images).toHaveLength(3);
  });

  it("throws UploadFailedError without confirming when every upload fails", async () => {
    mockApi();
    failUploadsAt([0, 1, 2]);

    const upload = uploadImages(ALBUM_ID, files(3));

    await expect(upload).rejects.toBeInstanceOf(UploadFailedError);
    await expect(upload).rejects.toMatchObject({ total: 3 });
    expect(confirmCall()).toBeUndefined();
  });

  it("counts files the server refused to confirm as failed too", async () => {
    // e.g. one file wasn't a real image: the API drops it from the confirmation.
    mockApi({ confirm: (keys) => keys.slice(0, 2) });

    const result = await uploadImages(ALBUM_ID, files(3));

    expect(result.failedCount).toBe(1);
  });

  it("propagates a confirmation error (e.g. 400 when nothing could be confirmed)", async () => {
    mockApi();
    mockApiFetch.mockImplementation(async (path) => {
      if (path === "/images/upload-urls") {
        return { albumId: ALBUM_ID, uploads: [{ key: "k", uploadUrl: "https://s3.test/0", fields: {} }] } as never;
      }
      throw new ApiError(400, "IMAGE_UPLOAD_FAILED");
    });

    await expect(uploadImages(ALBUM_ID, files(1))).rejects.toMatchObject({ status: 400 });
  });

  it("propagates a failure to get upload URLs", async () => {
    mockApiFetch.mockRejectedValue(new ApiError(403, "not a member"));

    await expect(uploadImages(ALBUM_ID, files(2))).rejects.toMatchObject({ status: 403 });
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it("uploads at most 4 files at a time", async () => {
    mockApi();
    let inFlight = 0;
    let peak = 0;
    mockUpload.mockImplementation(async () => {
      inFlight++;
      peak = Math.max(peak, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 5));
      inFlight--;
    });

    await uploadImages(ALBUM_ID, files(10));

    expect(mockUpload).toHaveBeenCalledTimes(10);
    expect(peak).toBe(4);
  });

  it("keeps the selection order when uploads finish out of order", async () => {
    mockApi();
    mockUpload.mockImplementation(async (url) => {
      const index = Number(url.split("/").pop());
      await new Promise((resolve) => setTimeout(resolve, (3 - index) * 5));
    });

    await uploadImages(ALBUM_ID, files(3));

    expect(confirmedKeys()).toEqual([
      `pending/${ALBUM_ID}/k0.jpg`,
      `pending/${ALBUM_ID}/k1.jpg`,
      `pending/${ALBUM_ID}/k2.jpg`,
    ]);
  });

  it("retries a transient network failure before giving up on a file", async () => {
    jest.useFakeTimers();
    try {
      mockApi();
      mockUpload.mockRejectedValueOnce(new NetworkError()).mockResolvedValue(undefined);

      const upload = uploadImages(ALBUM_ID, files(1));
      await jest.advanceTimersByTimeAsync(500);
      const result = await upload;

      expect(mockUpload).toHaveBeenCalledTimes(2);
      expect(result.failedCount).toBe(0);
    } finally {
      jest.useRealTimers();
    }
  });

  it("reports per-file progress ending in done/failed", async () => {
    mockApi();
    failUploadsAt([1]);
    const snapshots: FileUploadState[][] = [];

    await uploadImages(ALBUM_ID, files(2), { onProgress: (s) => snapshots.push(s) });

    expect(snapshots[snapshots.length - 1]).toEqual([
      { status: "done", progress: 1 },
      { status: "failed", progress: 0 },
    ]);
  });

  describe("multipart fallback (local storage, 501)", () => {
    beforeEach(() => {
      mockApiFetch.mockImplementation(async (path) => {
        if (path === "/images/upload-urls") throw new ApiError(501, "not implemented");
        if (path === "/images") return { id: "one", url: "/x" } as never;
        if (path === "/images/batch") return [{ id: "a", url: "/a" }, { id: "b", url: "/b" }] as never;
        throw new Error(path);
      });
    });

    it("uses the single-file endpoint for one file", async () => {
      const result = await uploadImages(ALBUM_ID, files(1));

      expect(result).toEqual({ images: [expect.objectContaining({ id: "one" })], failedCount: 0 });
      expect(mockUpload).not.toHaveBeenCalled();
    });

    it("uses the batch endpoint for several files", async () => {
      const result = await uploadImages(ALBUM_ID, files(2));

      expect(result.images).toHaveLength(2);
      expect(result.failedCount).toBe(0);
    });
  });
});
