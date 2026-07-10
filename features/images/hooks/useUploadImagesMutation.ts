import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImageFilePart, uploadImages } from "../api/image.api";
import { imageKeys } from "../api/queryKeys";

/** Uploads one or more photos to an album (presigned S3 flow, falling back to multipart) and revalidates that album's image list. */
export function useUploadImagesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ albumId, files }: { albumId: string; files: ImageFilePart[] }) =>
      uploadImages(albumId, files),
    onSuccess: (_data, { albumId }) => {
      queryClient.invalidateQueries({ queryKey: imageKeys.byAlbum(albumId) });
      queryClient.invalidateQueries({ queryKey: imageKeys.byAlbumInfinite(albumId) });
    },
  });
}
