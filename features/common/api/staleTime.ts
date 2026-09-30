/**
 * How long album and image lists count as fresh. Within this window, remounting a screen
 * or bringing the app back to the foreground reuses the cache instead of refetching.
 * Explicit refreshes (pull-to-refresh, invalidation after a mutation or a partner's push)
 * still refetch immediately. Signed image URLs stay valid for 24h+, far beyond this.
 */
export const LIST_STALE_TIME_MS = 30_000;
