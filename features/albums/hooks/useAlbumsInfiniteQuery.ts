import { LIST_STALE_TIME_MS } from "@/features/common/api/staleTime";
import { useInfiniteQuery } from "@tanstack/react-query";
import { listAlbums } from "../api/album.api";
import { albumKeys } from "../api/queryKeys";

const PAGE_SIZE = 10;

export function useAlbumsInfiniteQuery() {
  return useInfiniteQuery({
    queryKey: albumKeys.list(),
    queryFn: ({ pageParam }) => listAlbums({ page: pageParam, pageSize: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    staleTime: LIST_STALE_TIME_MS,
  });
}
