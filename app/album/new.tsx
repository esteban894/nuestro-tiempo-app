import { AlbumForm, albumKeys, createAlbum } from "@/features/albums";
import { getErrorMessage } from "@/features/common";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

export default function NewAlbumScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createAlbum,
    onSuccess: (album) => {
      queryClient.invalidateQueries({ queryKey: albumKeys.list() });
      router.replace({ pathname: "/album/[id]", params: { id: album.id } });
    },
    meta: { suppressErrorToast: true },
  });

  return (
    <AlbumForm
      submitLabel={t("albums.form.createSubmit")}
      onSubmit={(formData) => mutation.mutate(formData)}
      isSubmitting={mutation.isPending}
      error={getErrorMessage(mutation.error, t) ?? null}
    />
  );
}
