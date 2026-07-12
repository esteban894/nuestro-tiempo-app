import {
  ApiError,
  apiFetch,
  LocalFilePart,
  resolveMediaUrl,
  uploadToPresignedUrl,
} from "@/features/common/api/httpClient";

export interface Album {
  id: string;
  name?: string;
  createdBy: string;
  isPrivate: boolean;
  coverImage?: string | null;
  createdAt: string;
  /** Present on GET /albums/:id, absent on create/update responses. */
  updatedAt?: string;
}

export interface CurrentAlbum {
  id: string;
  name?: string;
  coverImage: string | null;
  createdAt: string;
  createdBy: string;
  isPrivate: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  count: number;
}

export type ListAlbumsParams = { page?: number; pageSize?: number };

export interface PresignedUpload {
  key: string;
  uploadUrl: string;
  fields: Record<string, string>;
  expiresAt: string;
}

export type CoverImageUploadResult =
  | { kind: "key"; coverImageKey: string }
  | { kind: "file"; coverImage: LocalFilePart };

function withResolvedCover<T extends { coverImage?: string | null }>(album: T): T {
  return { ...album, coverImage: resolveMediaUrl(album.coverImage) };
}

export async function listAlbums({ page = 1, pageSize = 10 }: ListAlbumsParams = {}) {
  const response = await apiFetch<PaginatedResponse<Album>>(
    `/albums?page=${page}&pageSize=${pageSize}`,
  );
  return { ...response, data: response.data.map(withResolvedCover) };
}

export async function getAlbum(id: string) {
  const album = await apiFetch<Album>(`/albums/${id}`);
  return withResolvedCover(album);
}

export async function createAlbum(formData: FormData) {
  const album = await apiFetch<Album>("/albums", { method: "POST", body: formData });
  return withResolvedCover(album);
}

export async function updateAlbum(id: string, formData: FormData) {
  const album = await apiFetch<Album>(`/albums/${id}`, { method: "PATCH", body: formData });
  return withResolvedCover(album);
}

async function requestCoverUploadUrl(filename: string, mimetype: string) {
  return apiFetch<PresignedUpload>("/albums/cover/upload-url", {
    method: "POST",
    body: { filename, mimetype },
  });
}

/**
 * Uploads an album cover directly to S3, preferring the presigned flow. Falls back to
 * returning the raw file part (for the caller to attach as a multipart `coverImage`
 * field) only when the API responds 501 — i.e. it's running in local-disk storage mode.
 */
export async function prepareCoverImageUpload(file: LocalFilePart): Promise<CoverImageUploadResult> {
  try {
    const presigned = await requestCoverUploadUrl(file.name, file.type);
    await uploadToPresignedUrl(presigned.uploadUrl, presigned.fields, file);
    return { kind: "key", coverImageKey: presigned.key };
  } catch (error) {
    if (error instanceof ApiError && error.status === 501) {
      return { kind: "file", coverImage: file };
    }
    throw error;
  }
}

export async function getCurrentAlbum() {
  const album = await apiFetch<CurrentAlbum>("/albums/current");
  return withResolvedCover(album);
}

export async function setCurrentAlbum(albumId: string) {
  const album = await apiFetch<CurrentAlbum>("/albums/current", {
    method: "PATCH",
    body: { albumId },
  });
  return withResolvedCover(album);
}

export async function deleteAlbum(id: string) {
  return apiFetch<{ deleted: boolean }>(`/albums/${id}`, { method: "DELETE" });
}
