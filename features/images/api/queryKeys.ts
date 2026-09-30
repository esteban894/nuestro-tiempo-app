import type { AlbumImageFilter } from "./image.api";

export const imageKeys = {
  all: ["images"] as const,
  /** Prefix of every cached list for an album, whatever the filter. Invalidate or update
   *  through this to reach them all. */
  byAlbum: (albumId: string) => ["images", "album", albumId] as const,
  /** One album list variant. Home and the album screen share the "all" entry. */
  albumList: (albumId: string, filter: AlbumImageFilter = "all") =>
    ["images", "album", albumId, "list", filter] as const,
  favorites: (filter: string) => ["images", "favorites", filter] as const,
};
