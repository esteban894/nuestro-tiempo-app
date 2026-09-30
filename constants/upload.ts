/** Max photos per upload batch. Must match the API's `IMAGE_UPLOAD_CONFIG.maxBatchSize`
 *  (nuestro-tiempo-api `src/common/config/file-upload.config.ts`): above it the API rejects
 *  the whole batch with a 400, so nothing gets uploaded. */
export const MAX_IMAGES_PER_BATCH = 20;
/** Photos uploaded to storage at the same time within a batch. */
export const UPLOAD_CONCURRENCY = 4;
/** Grid switches from 2 to 3 columns once an album holds this many (filtered) images. */
export const DENSE_GRID_IMAGE_THRESHOLD = 100;
