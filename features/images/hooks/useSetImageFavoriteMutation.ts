import { useAuthStore } from "@/features/auth";
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlbumImage, PaginatedResponse, setImageFavorite } from "../api/image.api";
import { imageKeys } from "../api/queryKeys";

type ImagesPage = InfiniteData<PaginatedResponse<AlbumImage>>;

interface ToggleFavoriteInput {
  id: string;
  favorite: boolean;
  albumId: string;
}

function withToggledFavorite(
  image: AlbumImage,
  favorite: boolean,
  me: { id: string; name: string },
): AlbumImage {
  if (image.favoritedByMe === favorite) return image;
  const favoritedBy = favorite
    ? [...image.favoritedBy, { userId: me.id, name: me.name }]
    : image.favoritedBy.filter((f) => f.userId !== me.id);
  return { ...image, favoritedBy, favoritedByMe: favorite };
}

export function useSetImageFavoriteMutation() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: ({ id, favorite }: ToggleFavoriteInput) => setImageFavorite(id, favorite),
    onMutate: async ({ id, favorite }: ToggleFavoriteInput) => {
      if (!user) return;
      await queryClient.cancelQueries({ queryKey: imageKeys.all });

      const previous = queryClient.getQueriesData<ImagesPage>({ queryKey: imageKeys.all });

      queryClient.setQueriesData<ImagesPage>({ queryKey: imageKeys.all }, (data) => {
        if (!data) return data;
        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            data: page.data.map((image) =>
              image.id === id ? withToggledFavorite(image, favorite, user) : image,
            ),
          })),
        };
      });

      return { previous };
    },
    onError: (_error, _variables, context) => {
      context?.previous.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: (_data, _error, { albumId }) => {
      queryClient.invalidateQueries({ queryKey: imageKeys.byAlbum(albumId) });
      queryClient.invalidateQueries({ queryKey: imageKeys.byAlbumInfinite(albumId) });
      queryClient.invalidateQueries({ queryKey: ["images", "favorites"] });
    },
  });
}
