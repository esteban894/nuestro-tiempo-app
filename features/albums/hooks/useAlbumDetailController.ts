import { DENSE_GRID_IMAGE_THRESHOLD, MAX_IMAGES_PER_BATCH } from "@/constants/upload";
import { useAuthStore } from "@/features/auth";
import { LIST_STALE_TIME_MS, showErrorToast } from "@/features/common";
import { usePartner } from "@/features/couple";
import {
  type AlbumImageFilter,
  buildImageFilePart,
  type FileUploadState,
  limitBatch,
  MediaLibraryPermissionError,
  type PickedImage,
  UploadFailedError,
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

export type FavoriteFilter = AlbumImageFilter;

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
    staleTime: LIST_STALE_TIME_MS,
  });

  const [favoriteFilter, setFavoriteFilter] = useState<FavoriteFilter>("all");
  // The filter UI only exists with a partner; if the couple breaks up while a partner
  // filter is selected, fall back to the full list instead of an always-empty one.
  const activeFilter: FavoriteFilter = partner ? favoriteFilter : "all";

  const {
    data: imagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching: isRefetchingImages,
    refetch: refetchImages,
  } = useAlbumImagesInfiniteQuery(id, activeFilter);
  // Already filtered by the API (and paged per filter), not by what happens to be loaded.
  const filteredAlbumImages = imagesData?.pages.flatMap((page) => page.data) ?? [];
  const images = filteredAlbumImages.map((image) => ({ id: image.id, url: image.url }));
  const imageGridColumns =
    images.length > DENSE_GRID_IMAGE_THRESHOLD ? 3 : undefined;

  const uploadImagesMutation = useUploadImagesMutation();
  const deleteImageMutation = useDeleteImageMutation();
  const downloadImageMutation = useDownloadImageMutation();
  const setFavoriteMutation = useSetImageFavoriteMutation();
  const deleteAlbumMutation = useDeleteAlbumMutation();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<FileUploadState[] | null>(null);
  const [uploadUris, setUploadUris] = useState<string[]>([]);
  const uploadItems = uploadProgress?.map((state, index) => ({ ...state, uri: uploadUris[index] }));
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

    const { items: picked, truncated } = limitBatch(assets);
    if (truncated) {
      Toast.show({
        type: "info",
        text1: t("albums.tooManyPhotos.title"),
        text2: t("albums.tooManyPhotos.message", { max: MAX_IMAGES_PER_BATCH }),
      });
    }

    setUploadUris(picked.map((asset) => asset.uri));
    setUploadProgress(picked.map(() => ({ status: "pending", progress: 0 })));
    uploadImagesMutation.mutate(
      {
        albumId: id,
        files: picked.map(buildImageFilePart),
        onProgress: setUploadProgress,
      },
      {
        onSuccess: ({ failedCount }) => {
          if (failedCount > 0) {
            Toast.show({
              type: "error",
              text1: t("albums.uploadPartialError.title", { count: failedCount }),
              text2: t("albums.uploadPartialError.message"),
            });
          }
        },
        onError: (error) => {
          if (error instanceof UploadFailedError) {
            Toast.show({
              type: "error",
              text1: t("albums.uploadAllFailed.title", { count: error.total }),
              text2: t("albums.uploadPartialError.message"),
            });
          } else {
            showErrorToast(error);
          }
        },
        onSettled: () => setUploadProgress(null),
      },
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
    uploadItems,
  };
}
