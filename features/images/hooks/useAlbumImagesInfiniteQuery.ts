import { useInfiniteQuery } from "@tanstack/react-query";
import { listImagesByAlbum } from "../api/image.api";
import { imageKeys } from "../api/queryKeys";

const PAGE_SIZE = 24;

export function useAlbumImagesInfiniteQuery(albumId: string | undefined) {
  return useInfiniteQuery({
    queryKey: imageKeys.byAlbumInfinite(albumId ?? ""),
    queryFn: ({ pageParam }) =>
      listImagesByAlbum(albumId as string, { page: pageParam, pageSize: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled: !!albumId,
  });
}
