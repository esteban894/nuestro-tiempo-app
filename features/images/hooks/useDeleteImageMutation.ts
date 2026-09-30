import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeImageFromAlbumCache } from "../api/albumImagesCache";
import { deleteImage } from "../api/image.api";

export function useDeleteImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; albumId: string }) => deleteImage(id),
    onSuccess: (_data, { id, albumId }) => {
      removeImageFromAlbumCache(queryClient, albumId, id);
      queryClient.invalidateQueries({ queryKey: ["images", "favorites"] });
    },
  });
}
