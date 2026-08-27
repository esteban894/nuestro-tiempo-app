import type { ImageFilePart } from "../api/image.api";

/** What the presigned-upload endpoints (`POST /images/upload-urls`,
 *  `POST /albums/cover/upload-url`) accept as `mimetype`. The value is baked into the S3
 *  policy, so anything outside this list is a 400 — unlike the multipart fallback, which
 *  sniffs the real bytes and ignores what we declare. */
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/avif",
]);

const MIME_TYPE_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
  avif: "image/avif",
};

const FALLBACK_MIME_TYPE = "image/jpeg";
const FALLBACK_FILENAME = "photo.jpg";

/** The subset of an expo-image-picker asset an upload needs. */
export type PickedImage = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

function resolveFileName(asset: PickedImage): string {
  // `||` rather than `??`: a uri ending in "/" yields an empty last segment, and the
  // presigned-url endpoint expects a non-empty filename.
  return asset.fileName || asset.uri.split("/").pop() || FALLBACK_FILENAME;
}

function resolveMimeType(asset: PickedImage, fileName: string): string {
  // The picker's own type is the only source that saw the actual asset; the extension is a
  // guess, and content:// / ph:// URIs often carry none at all.
  const declared = asset.mimeType?.toLowerCase();
  if (declared && ALLOWED_MIME_TYPES.has(declared)) return declared;

  const extension = fileName.split(".").pop()?.toLowerCase();
  return (extension && MIME_TYPE_BY_EXTENSION[extension]) || FALLBACK_MIME_TYPE;
}

/** Builds the upload part for a picked image. The API stores the file under a UUID and
 *  derives the extension from its bytes, so `name` only has to be plausible — `type` is the
 *  field that matters, and it must be honest for the presigned S3 path to work. */
export function buildImageFilePart(asset: PickedImage): ImageFilePart {
  const name = resolveFileName(asset);
  return { uri: asset.uri, name, type: resolveMimeType(asset, name) };
}
