import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { AlbumImagesPage } from "./image.api";
import { imageKeys } from "./queryKeys";

export type AlbumImagesData = InfiniteData<AlbumImagesPage, string | null>;

/**
 * Shows new images at the top of every cached list of an album while refetching only
 * the first page.
 *
 * Invalidating an infinite query refetches every page it has loaded, one after another —
 * after scrolling 10 pages, one upload meant 10 requests. New images always land on page
 * one (lists are newest-first), so the cached pages are trimmed to the first before
 * invalidating. The old first page stays on screen until the fresh one arrives.
 */
export async function refreshAlbumImagesFirstPage(queryClient: QueryClient, albumId: string) {
  const queryKey = imageKeys.byAlbum(albumId);
  // An in-flight fetchNextPage would otherwise re-append a page after the trim.
  await queryClient.cancelQueries({ queryKey });
  queryClient.setQueriesData<AlbumImagesData>({ queryKey }, (data) =>
    data && data.pages.length > 1
      ? { pages: data.pages.slice(0, 1), pageParams: data.pageParams.slice(0, 1) }
      : data,
  );
  await queryClient.invalidateQueries({ queryKey });
}

/** Drops a deleted image from every cached list of its album, without refetching. The
 *  remaining pages stay valid: cursors point at positions, not offsets. */
export function removeImageFromAlbumCache(
  queryClient: QueryClient,
  albumId: string,
  imageId: string,
) {
  queryClient.setQueriesData<AlbumImagesData>({ queryKey: imageKeys.byAlbum(albumId) }, (data) => {
    if (!data) return data;
    let changed = false;
    const pages = data.pages.map((page) => {
      const remaining = page.data.filter((image) => image.id !== imageId);
      if (remaining.length === page.data.length) return page;
      changed = true;
      return { ...page, data: remaining, count: remaining.length };
    });
    return changed ? { ...data, pages } : data;
  });
}

/**
 * After a favorite toggle the optimistic update already made the unfiltered list correct,
 * and refetching it would reload every page the user scrolled through. Only the filtered
 * variants (me/partner/both) can gain or lose an image, so only those are invalidated,
 * plus the cross-album favorites screen.
 */
export function invalidateAfterFavoriteToggle(queryClient: QueryClient, albumId: string) {
  queryClient.invalidateQueries({
    queryKey: imageKeys.byAlbum(albumId),
    predicate: (query) => query.queryKey[4] !== "all",
  });
  queryClient.invalidateQueries({ queryKey: ["images", "favorites"] });
}
