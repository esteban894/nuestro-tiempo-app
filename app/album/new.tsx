import { AlbumForm, albumKeys, createAlbum } from "@/features/albums";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";

export default function NewAlbumScreen() {
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
      submitLabel="Crear álbum"
      onSubmit={(formData) => mutation.mutate(formData)}
      isSubmitting={mutation.isPending}
      error={mutation.error?.message ?? null}
    />
  );
}
