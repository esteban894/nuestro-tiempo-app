import { MAX_IMAGES_PER_BATCH } from "@/constants/upload";

/** Caps a picked selection to what one upload batch may carry, keeping the pick order.
 *  The picker's own `selectionLimit` already enforces this where the OS supports it;
 *  this is the fallback for platforms that ignore it. */
export function limitBatch<T>(
  items: T[],
  max: number = MAX_IMAGES_PER_BATCH,
): { items: T[]; truncated: boolean } {
  return items.length > max
    ? { items: items.slice(0, max), truncated: true }
    : { items, truncated: false };
}
