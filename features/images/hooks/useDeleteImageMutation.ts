import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteImage } from "../api/image.api";
import { imageKeys } from "../api/queryKeys";

export function useDeleteImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; albumId: string }) => deleteImage(id),
    onSuccess: (_data, { albumId }) => {
      queryClient.invalidateQueries({ queryKey: imageKeys.byAlbum(albumId) });
    },
  });
}
