import { useQuery } from "@tanstack/react-query";
import { listImagesByAlbum } from "../api/image.api";
import { imageKeys } from "../api/queryKeys";

/** Images for a given album (GET /images/album/:albumId). */
export function useAlbumImagesQuery(albumId: string | undefined) {
  return useQuery({
    queryKey: imageKeys.byAlbum(albumId ?? ""),
    queryFn: () => listImagesByAlbum(albumId as string, { pageSize: 50 }),
    enabled: !!albumId,
  });
}
