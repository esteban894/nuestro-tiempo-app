import { apiFetch, resolveMediaUrl } from "@/features/common/api/httpClient";

export interface AlbumImage {
  id: string;
  filename: string;
  url: string;
  size: number;
  albumId: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  count: number;
}

export type ListImagesParams = { page?: number; pageSize?: number };

/** React Native multipart file part shape (not a real Blob/File). */
export interface ImageFilePart {
  uri: string;
  name: string;
  type: string;
}

export interface CreatedImage {
  id: string;
  url: string;
}

export async function listImagesByAlbum(
  albumId: string,
  { page = 1, pageSize = 50 }: ListImagesParams = {},
) {
  const response = await apiFetch<PaginatedResponse<AlbumImage>>(
    `/images/album/${albumId}?page=${page}&pageSize=${pageSize}`,
  );
  return {
    ...response,
    data: response.data.map((image) => ({ ...image, url: resolveMediaUrl(image.url) })),
  };
}

export async function createImage(albumId: string, file: ImageFilePart) {
  const formData = new FormData();
  formData.append("albumId", albumId);
  formData.append("file", file as unknown as Blob);

  const response = await apiFetch<CreatedImage>("/images", { method: "POST", body: formData });
  return { ...response, url: resolveMediaUrl(response.url) };
}

export async function deleteImage(id: string) {
  return apiFetch<{ deleted: boolean }>(`/images/${id}`, { method: "DELETE" });
}
