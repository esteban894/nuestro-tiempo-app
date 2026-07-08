import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createImage, ImageFilePart } from "../api/image.api";
import { imageKeys } from "../api/queryKeys";

/** Uploads a photo to an album (POST /images) and revalidates that album's image list. */
export function useCreateImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ albumId, file }: { albumId: string; file: ImageFilePart }) =>
      createImage(albumId, file),
    onSuccess: (_data, { albumId }) => {
      queryClient.invalidateQueries({ queryKey: imageKeys.byAlbum(albumId) });
    },
  });
}
