import { LIST_STALE_TIME_MS } from "@/features/common/api/staleTime";
import { infiniteQueryOptions, useInfiniteQuery } from "@tanstack/react-query";
import { type AlbumImageFilter, type AlbumImagesPage, listImagesByAlbum } from "../api/image.api";
import { imageKeys } from "../api/queryKeys";

export const ALBUM_IMAGES_PAGE_SIZE = 24;

export function getNextAlbumImagesCursor(lastPage: AlbumImagesPage): string | undefined {
  return lastPage.nextCursor ?? undefined;
}

export function albumImagesQueryOptions(albumId: string | undefined, filter: AlbumImageFilter = "all") {
  return infiniteQueryOptions({
    queryKey: imageKeys.albumList(albumId ?? "", filter),
    queryFn: ({ pageParam }) =>
      listImagesByAlbum(albumId as string, {
        cursor: pageParam,
        pageSize: ALBUM_IMAGES_PAGE_SIZE,
        filter,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: getNextAlbumImagesCursor,
    enabled: !!albumId,
    staleTime: LIST_STALE_TIME_MS,
  });
}

/** An album's images, newest first, paged by cursor. `filter` is applied by the API and
 *  is part of the cache key, so each variant pages independently. */
export function useAlbumImagesInfiniteQuery(
  albumId: string | undefined,
  filter: AlbumImageFilter = "all",
) {
  return useInfiniteQuery(albumImagesQueryOptions(albumId, filter));
}
