import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImageFilePart, uploadImages } from "../api/image.api";
import { imageKeys } from "../api/queryKeys";

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
