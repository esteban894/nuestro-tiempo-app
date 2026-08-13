import { useMutation } from "@tanstack/react-query";
import { File, Paths } from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

export class MediaLibraryPermissionError extends Error {
  constructor() {
    super("Se necesita permiso para acceder a la galería.");
    this.name = "MediaLibraryPermissionError";
  }
}

export function useDownloadImageMutation() {
  return useMutation({
    mutationFn: async ({ url, filename }: { url: string; filename: string }) => {
      const { granted } = await MediaLibrary.requestPermissionsAsync();
      if (!granted) throw new MediaLibraryPermissionError();

      const destination = new File(Paths.cache, filename);
      const downloaded = await File.downloadFileAsync(url, destination, { idempotent: true });
      try {
        await MediaLibrary.saveToLibraryAsync(downloaded.uri);
      } finally {
        downloaded.delete();
      }
    },
    meta: { suppressErrorToast: true },
  });
}
