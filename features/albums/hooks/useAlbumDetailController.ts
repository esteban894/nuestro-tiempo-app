import { DENSE_GRID_IMAGE_THRESHOLD, MAX_IMAGES_PER_BATCH } from "@/constants/upload";
import { useAuthStore } from "@/features/auth";
import { usePartner } from "@/features/couple";
import {
  AlbumImage,
  buildImageFilePart,
  MediaLibraryPermissionError,
  type PickedImage,
  useAlbumImagesInfiniteQuery,
  useDeleteImageMutation,
  useDownloadImageMutation,
  useSetImageFavoriteMutation,
  useUploadImagesMutation,
} from "@/features/images";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";
import { getAlbum, setCurrentAlbum } from "../api/album.api";
import { albumKeys } from "../api/queryKeys";
import { useDeleteAlbumMutation } from "./useDeleteAlbumMutation";

export type FavoriteFilter = "all" | "me" | "partner" | "both";

function filterByFavorite(
  images: AlbumImage[],
  filter: FavoriteFilter,
  partnerId: string | undefined,
): AlbumImage[] {
  if (filter === "all") return images;
  const favoritedByPartner = (image: AlbumImage) =>
    !!partnerId && image.favoritedBy.some((f) => f.userId === partnerId);

  if (filter === "me") return images.filter((image) => image.favoritedByMe);
  if (filter === "partner") return images.filter(favoritedByPartner);
  return images.filter((image) => image.favoritedByMe && favoritedByPartner(image));
}

export function useAlbumDetailController(id: string) {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const partner = usePartner();
  const currentUserId = useAuthStore((state) => state.user?.id);

  const {
    data: album,
    isLoading,
    isError,
  } = useQuery({
    queryKey: albumKeys.detail(id),
    queryFn: () => getAlbum(id),
    enabled: !!id,
  });

  const {
    data: imagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching: isRefetchingImages,
    refetch: refetchImages,
  } = useAlbumImagesInfiniteQuery(id);
  const albumImages = imagesData?.pages.flatMap((page) => page.data) ?? [];

  const [favoriteFilter, setFavoriteFilter] = useState<FavoriteFilter>("all");
  const filteredAlbumImages = filterByFavorite(albumImages, favoriteFilter, partner?.id);
  const images = filteredAlbumImages.map((image) => ({ id: image.id, url: image.url }));
  const imageGridColumns =
    images.length > DENSE_GRID_IMAGE_THRESHOLD ? 3 : undefined;

  const uploadImagesMutation = useUploadImagesMutation();
  const deleteImageMutation = useDeleteImageMutation();
  const downloadImageMutation = useDownloadImageMutation();
  const setFavoriteMutation = useSetImageFavoriteMutation();
  const deleteAlbumMutation = useDeleteAlbumMutation();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [uploadCount, setUploadCount] = useState<number | null>(null);
  const retriedImageIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    retriedImageIdsRef.current = new Set();
  }, [id]);

  const handleImageError = (item: { id: string }) => {
    if (retriedImageIdsRef.current.has(item.id)) return;
    retriedImageIdsRef.current.add(item.id);
    refetchImages();
  };

  const handleRefreshImages = () => {
    retriedImageIdsRef.current = new Set();
    refetchImages();
  };

  const markAsCurrentMutation = useMutation({
    mutationFn: () => setCurrentAlbum(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: albumKeys.current() });
    },
  });

  const handleEdit = () => router.push({ pathname: "/album/[id]/edit", params: { id } });

  const handleMarkAsCurrent = () => markAsCurrentMutation.mutate();

  const handleDeleteAlbum = () => {
    Alert.alert(t("albums.deleteConfirm.title"), t("albums.deleteConfirm.message"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => {
          deleteAlbumMutation.mutate(id, { onSuccess: () => router.replace("/albums") });
        },
      },
    ]);
  };

  const handleDeleteImage = (index: number) => {
    const image = filteredAlbumImages[index];
    if (!image) return;
    deleteImageMutation.mutate({ id: image.id, albumId: id });
  };

  const handleToggleFavorite = (index: number) => {
    const image = filteredAlbumImages[index];
    if (!image) return;
    setFavoriteMutation.mutate({ id: image.id, favorite: !image.favoritedByMe, albumId: id });
  };

  const handleDownloadImage = (index: number) => {
    const image = filteredAlbumImages[index];
    if (!image) return;
    downloadImageMutation.mutate(
      { url: image.url, filename: image.filename },
      {
        onSuccess: () => {
          Toast.show({ type: "success", text1: t("albums.downloadToast.success") });
        },
        onError: (error) => {
          Toast.show({
            type: "error",
            text1: t("albums.downloadToast.errorTitle"),
            text2:
              error instanceof MediaLibraryPermissionError
                ? t("albums.downloadToast.permissionMessage")
                : undefined,
          });
        },
      },
    );
  };

  const handlePickImages = (assets: PickedImage[]) => {
    if (assets.length === 0) return;

    let files = assets;
    if (files.length > MAX_IMAGES_PER_BATCH) {
      files = files.slice(0, MAX_IMAGES_PER_BATCH);
      Toast.show({
        type: "info",
        text1: t("albums.tooManyPhotos.title"),
        text2: t("albums.tooManyPhotos.message", { max: MAX_IMAGES_PER_BATCH }),
      });
    }

    setUploadCount(files.length);
    uploadImagesMutation.mutate(
      { albumId: id, files: files.map(buildImageFilePart) },
      { onSettled: () => setUploadCount(null) },
    );
  };

  const handleFetchNextPage = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  return {
    album,
    isLoading,
    isError,
    partner,
    currentUserId,
    favoriteFilter,
    setFavoriteFilter,
    images,
    imageGridColumns,
    filteredAlbumImages,
    isFetchingNextPage,
    isRefetchingImages,
    handleFetchNextPage,
    handleImageError,
    handleRefreshImages,
    handleEdit,
    handleMarkAsCurrent,
    handleDeleteAlbum,
    handleDeleteImage,
    handleToggleFavorite,
    handleDownloadImage,
    handlePickImages,
    markAsCurrentMutation,
    deleteAlbumMutation,
    uploadImagesMutation,
    pickerVisible,
    setPickerVisible,
    uploadCount,
  };
}
