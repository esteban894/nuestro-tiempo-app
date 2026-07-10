export const imageKeys = {
  all: ["images"] as const,
  byAlbum: (albumId: string) => ["images", "album", albumId] as const,
  byAlbumInfinite: (albumId: string) => ["images", "album", albumId, "infinite"] as const,
};
