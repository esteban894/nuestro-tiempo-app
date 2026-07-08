import { AlbumForm, AlbumFormValues, mockAlbums } from "@/features/albums";
import { useRouter } from "expo-router";

export default function NewAlbumScreen() {
  const router = useRouter();

  const handleSubmit = (values: AlbumFormValues) => {
    const id = Date.now().toString();
    mockAlbums.push({
      id,
      title: values.title,
      coverImage: values.coverImage,
      isPrivate: values.isPrivate,
      images: values.coverImage ? [values.coverImage] : [],
    });
    router.replace({ pathname: "/album/[id]", params: { id } });
  };

  return <AlbumForm submitLabel="Crear álbum" onSubmit={handleSubmit} />;
}
