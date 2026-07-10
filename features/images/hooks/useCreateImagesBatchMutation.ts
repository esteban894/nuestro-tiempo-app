import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createImagesBatch, ImageFilePart } from "../api/image.api";
import { imageKeys } from "../api/queryKeys";

/** Uploads multiple photos to an album in one request (POST /images/batch) and revalidates that album's image list. */
export function useCreateImagesBatchMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ albumId, files }: { albumId: string; files: ImageFilePart[] }) =>
      createImagesBatch(albumId, files),
    onSuccess: (_data, { albumId }) => {
      queryClient.invalidateQueries({ queryKey: imageKeys.byAlbum(albumId) });
      queryClient.invalidateQueries({ queryKey: imageKeys.byAlbumInfinite(albumId) });
    },
  });
}
