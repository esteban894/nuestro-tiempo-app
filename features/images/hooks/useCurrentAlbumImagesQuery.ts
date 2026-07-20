import { useInfiniteQuery } from "@tanstack/react-query";
import { listImagesByAlbum } from "../api/image.api";
import { imageKeys } from "../api/queryKeys";

const PAGE_SIZE = 10;

/**
 * Images for the couple's current album, loaded a few at a time (GET /images/album/:albumId).
 * Backs the home carousel, which is a preview rather than a full album view — pages start
 * small (PAGE_SIZE) and only grow as the carousel is swiped through (or autoplays) toward
 * the end of what's loaded, instead of eagerly downloading the whole album up front like the
 * old single-page `pageSize: 50` fetch used to.
 *
 * Deliberately keeps the `byAlbum` query key (not a new one) so the existing
 * upload/delete/notification invalidations (`imageKeys.byAlbum`) keep working unchanged —
 * see useUploadImagesMutation, useDeleteImageMutation, notificationDispatch.
 */
export function useCurrentAlbumImagesQuery(albumId: string | undefined) {
  return useInfiniteQuery({
    queryKey: imageKeys.byAlbum(albumId ?? ""),
    queryFn: ({ pageParam }) =>
      listImagesByAlbum(albumId as string, { page: pageParam, pageSize: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled: !!albumId,
  });
}
