import { buildQuery } from "@/features/common/api/buildQuery";
import {
  ApiError,
  apiFetch,
  LocalFilePart,
  resolveMediaUrl,
  uploadToPresignedUrl,
} from "@/features/common/api/httpClient";

export interface Favoriter {
  userId: string;
  name: string;
}

export type FavoritedByFilter = "me" | "partner" | "both";

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
  { page = 1, pageSize = 20, favoritedBy }: ListImagesParams = {},
) {
  const response = await apiFetch<PaginatedResponse<AlbumImage>>(
    `/images/album/${albumId}${buildQuery({ page, pageSize, favoritedBy })}`,
  );
  return {
    ...response,
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

export async function uploadImages(albumId: string, files: ImageFilePart[]) {
  let uploads: PresignedUpload[];
  try {
    const requested = await requestImageUploadUrls(
      albumId,
      files.map((file) => ({ filename: file.name, mimetype: file.type })),
    );
    uploads = requested.uploads;
  } catch (error) {
    if (error instanceof ApiError && error.status === 501) {
      return files.length === 1
        ? [await createImage(albumId, files[0])]
        : createImagesBatch(albumId, files);
    }
    throw error;
  }

  await Promise.all(
    uploads.map((upload, index) =>
      uploadToPresignedUrl(upload.uploadUrl, upload.fields, files[index]),
    ),
  );

  return confirmImageUploads(
    albumId,
    uploads.map((upload) => upload.key),
  );
}
