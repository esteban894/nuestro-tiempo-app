import { useInfiniteQuery } from "@tanstack/react-query";
import { FavoritedByFilter, listFavoriteImages } from "../api/image.api";
import { imageKeys } from "../api/queryKeys";

const PAGE_SIZE = 24;

export function useFavoriteImagesInfiniteQuery(favoritedBy: FavoritedByFilter) {
  return useInfiniteQuery({
    queryKey: imageKeys.favorites(favoritedBy),
    queryFn: ({ pageParam }) =>
      listFavoriteImages({ favoritedBy, page: pageParam, pageSize: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });
}
