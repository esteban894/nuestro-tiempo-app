import { UPLOAD_CONCURRENCY } from "@/constants/upload";
import { buildQuery } from "@/features/common/api/buildQuery";
import {
  ApiError,
  apiFetch,
  LocalFilePart,
  resolveMediaUrl,
  uploadToPresignedUrl,
} from "@/features/common/api/httpClient";
import { runWithConcurrency } from "@/features/common/utils/runWithConcurrency";
import { createUploadProgressTracker, type FileUploadState } from "../utils/uploadProgress";
import { uploadWithRetry } from "../utils/uploadWithRetry";

export interface Favoriter {
  userId: string;
  name: string;
}

export type FavoritedByFilter = "me" | "partner" | "both";
/** Album image list variant: every image, or only those favorited by me/partner/both. */
export type AlbumImageFilter = "all" | FavoritedByFilter;

export interface AlbumImage {
  id: string;
  filename: string;
  url: string;
  size: number;
  albumId: string;
  createdAt: string;
  favoritedBy: Favoriter[];
  favoritedByMe: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  count: number;
}

export type ListImagesParams = {
  page?: number;
  pageSize?: number;
  favoritedBy?: FavoritedByFilter;
};

/** A page of an album listing. Paged by opaque cursor: `nextCursor` is null on the last
 *  page. The first page (no cursor) also carries totals; cursor pages don't. */
export interface AlbumImagesPage {
  data: AlbumImage[];
  pageSize: number;
  count: number;
  nextCursor: string | null;
  totalRecords?: number;
}

export type ListAlbumImagesParams = {
  cursor?: string | null;
  pageSize?: number;
  filter?: AlbumImageFilter;
};

export type ImageFilePart = LocalFilePart;

export interface CreatedImage {
  id: string;
  url: string;
}

export interface PresignedUpload {
  key: string;
  uploadUrl: string;
  fields: Record<string, string>;
  expiresAt: string;
}

export async function listImagesByAlbum(
  albumId: string,
  { cursor, pageSize = 24, filter = "all" }: ListAlbumImagesParams = {},
): Promise<AlbumImagesPage> {
  const response = await apiFetch<AlbumImagesPage>(
    `/images/album/${albumId}${buildQuery({
      pageSize,
      cursor,
      favoritedBy: filter === "all" ? undefined : filter,
    })}`,
  );
  return {
    ...response,
    // An API predating cursor pagination omits the field; treat that as "no more pages"
    // rather than looping on the first page.
    nextCursor: response.nextCursor ?? null,
    data: response.data.map((image) => ({ ...image, url: resolveMediaUrl(image.url) })),
  };
}

export async function listFavoriteImages({
  favoritedBy,
  page = 1,
  pageSize = 20,
}: ListImagesParams = {}) {
  const response = await apiFetch<PaginatedResponse<AlbumImage>>(
    `/images${buildQuery({ page, pageSize, favoritedBy })}`,
  );
  return {
    ...response,
    data: response.data.map((image) => ({ ...image, url: resolveMediaUrl(image.url) })),
  };
}

export async function setImageFavorite(id: string, favorite: boolean) {
  const response = await apiFetch<AlbumImage>(`/images/${id}/favorite`, {
    method: "PATCH",
    body: { favorite },
  });
  return { ...response, url: resolveMediaUrl(response.url) };
}

export async function createImage(albumId: string, file: ImageFilePart) {
  const formData = new FormData();
  formData.append("albumId", albumId);
  formData.append("file", file as unknown as Blob);

  const response = await apiFetch<CreatedImage>("/images", { method: "POST", body: formData });
  return { ...response, url: resolveMediaUrl(response.url) };
}

export async function createImagesBatch(albumId: string, files: ImageFilePart[]) {
  const formData = new FormData();
  formData.append("albumId", albumId);
  // Each file gets its own field name (rather than repeating "files") to avoid a known
  // React Native issue where multiple FormData parts under the same key can be dropped
  // or corrupted by the native networking bridge on some platforms. The API accepts
  // files under any field name (AnyFilesInterceptor), so this is safe server-side.
  files.forEach((file, index) => formData.append(`files_${index}`, file as unknown as Blob));

  const response = await apiFetch<CreatedImage[]>("/images/batch", {
    method: "POST",
    body: formData,
  });
  return response.map((image) => ({ ...image, url: resolveMediaUrl(image.url) }));
}

export async function deleteImage(id: string) {
  return apiFetch<{ deleted: boolean }>(`/images/${id}`, { method: "DELETE" });
}

async function requestImageUploadUrls(
  albumId: string,
  files: { filename: string; mimetype: string }[],
) {
  return apiFetch<{ albumId: string; uploads: PresignedUpload[] }>("/images/upload-urls", {
    method: "POST",
    body: { albumId, files },
  });
}

async function confirmImageUploads(albumId: string, keys: string[]) {
  const response = await apiFetch<CreatedImage[]>("/images/confirm", {
    method: "POST",
    body: { albumId, keys },
  });
  return response.map((image) => ({ ...image, url: resolveMediaUrl(image.url) }));
}

/** Thrown when not a single file of a batch reached storage, so nothing was confirmed. */
export class UploadFailedError extends Error {
  readonly total: number;

  constructor(total: number) {
    super(`None of the ${total} files could be uploaded.`);
    this.name = "UploadFailedError";
    this.total = total;
  }
}

export interface UploadImagesResult {
  images: CreatedImage[];
  /** Files that didn't make it: storage upload failed after retries, or the API rejected
   *  the confirmation (e.g. not a real image). */
  failedCount: number;
}

export type UploadImagesOptions = {
  onProgress?: (states: FileUploadState[]) => void;
};

/**
 * Uploads a batch straight to storage, at most `UPLOAD_CONCURRENCY` files at a time with
 * per-file retries, then confirms only the files that arrived. One failed file no longer
 * sinks the batch: the rest are confirmed and `failedCount` says how many were lost.
 */
export async function uploadImages(
  albumId: string,
  files: ImageFilePart[],
  { onProgress }: UploadImagesOptions = {},
): Promise<UploadImagesResult> {
  let uploads: PresignedUpload[];
  try {
    const requested = await requestImageUploadUrls(
      albumId,
      files.map((file) => ({ filename: file.name, mimetype: file.type })),
    );
    uploads = requested.uploads;
  } catch (error) {
    if (error instanceof ApiError && error.status === 501) {
      // Multipart fallback (local storage): one request, all-or-nothing.
      const images =
        files.length === 1
          ? [await createImage(albumId, files[0])]
          : await createImagesBatch(albumId, files);
      return { images, failedCount: 0 };
    }
    throw error;
  }

  const tracker = createUploadProgressTracker(files.length, onProgress ?? (() => {}));
  const results = await runWithConcurrency(
    uploads.slice(0, files.length),
    UPLOAD_CONCURRENCY,
    async (upload, index) => {
      try {
        await uploadWithRetry(
          (report) =>
            uploadToPresignedUrl(upload.uploadUrl, upload.fields, files[index], {
              onProgress: report,
            }),
          { onProgress: (fraction) => tracker.progress(index, fraction) },
        );
      } catch (error) {
        tracker.fail(index);
        throw error;
      }
      tracker.done(index);
      return upload.key;
    },
  );

  const uploadedKeys = results.flatMap((result) =>
    result.status === "fulfilled" ? [result.value] : [],
  );
  if (uploadedKeys.length === 0) throw new UploadFailedError(files.length);

  const images = await confirmImageUploads(albumId, uploadedKeys);
  return { images, failedCount: Math.max(files.length - images.length, 0) };
}
