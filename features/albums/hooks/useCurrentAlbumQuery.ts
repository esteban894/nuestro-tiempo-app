import { LIST_STALE_TIME_MS } from "@/features/common/api/staleTime";
import { useQuery } from "@tanstack/react-query";
import { getCurrentAlbum } from "../api/album.api";
import { albumKeys } from "../api/queryKeys";

export function useCurrentAlbumQuery() {
  return useQuery({
    queryKey: albumKeys.current(),
    queryFn: getCurrentAlbum,
    retry: false,
    staleTime: LIST_STALE_TIME_MS,
  });
}
