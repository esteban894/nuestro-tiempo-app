import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAlbum } from "../api/album.api";
import { albumKeys } from "../api/queryKeys";

/** Deletes an album (DELETE /albums/:id) and revalidates the album list and current album. */
export function useDeleteAlbumMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAlbum(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: albumKeys.list() });
      queryClient.invalidateQueries({ queryKey: albumKeys.current() });
      queryClient.removeQueries({ queryKey: albumKeys.detail(id) });
    },
  });
}
