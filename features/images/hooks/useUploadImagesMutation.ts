import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refreshAlbumImagesFirstPage } from "../api/albumImagesCache";
import { ImageFilePart, uploadImages, type UploadImagesOptions } from "../api/image.api";

export function useUploadImagesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      albumId,
      files,
      onProgress,
    }: { albumId: string; files: ImageFilePart[] } & UploadImagesOptions) =>
      uploadImages(albumId, files, { onProgress }),
    onSuccess: (_data, { albumId }) => refreshAlbumImagesFirstPage(queryClient, albumId),
    // The caller shows upload-specific toasts (partial / total failure).
    meta: { suppressErrorToast: true },
  });
}
