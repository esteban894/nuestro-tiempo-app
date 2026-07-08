import { apiFetch, resolveMediaUrl } from "@/features/common/api/httpClient";

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
