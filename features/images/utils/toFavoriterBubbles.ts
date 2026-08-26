import { FavoriterBubble } from "@/features/common";
import { AlbumImage } from "../api/image.api";

export function toFavoriterBubbles(image: AlbumImage, currentUserId?: string): FavoriterBubble[] {
  return image.favoritedBy.map((favoriter) => ({
    name: favoriter.name,
    tone: favoriter.userId === currentUserId ? "me" : "partner",
  }));
}
