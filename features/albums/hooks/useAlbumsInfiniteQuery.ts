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
      // Also stops correctly on an empty list (totalPages === 0, so 1 < 0 is false).
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });
}
