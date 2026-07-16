/** Upload-related configuration shared across the app. */

/**
 * Maximum number of images a user can select and upload in a single batch.
 * Enforced natively via the image picker's `selectionLimit`, and re-checked
 * on the client before firing the upload mutation (defense in depth).
 */
export const MAX_IMAGES_PER_BATCH = 30;
