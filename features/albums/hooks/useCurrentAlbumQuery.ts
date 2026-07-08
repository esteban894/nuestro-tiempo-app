import { useQuery } from "@tanstack/react-query";
import { getCurrentAlbum } from "../api/album.api";
import { albumKeys } from "../api/queryKeys";

/**
 * Query for the user's current album (GET /albums/current).
 * Created for future use — no consumer yet; it's the invalidation target of the
 * "mark as current" mutation in the album detail screen.
 */
export function useCurrentAlbumQuery() {
  return useQuery({
    queryKey: albumKeys.current(),
    queryFn: getCurrentAlbum,
    retry: false,
  });
}
