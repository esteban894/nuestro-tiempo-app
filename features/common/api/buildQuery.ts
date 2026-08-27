type QueryValue = string | number | undefined | null;

/** Serializes query params for the API's list endpoints.
 *
 *  The API validates query strings against per-endpoint DTOs with
 *  `forbidNonWhitelisted`, so anything unexpected is a 400 rather than something the
 *  server quietly ignores. Two rules follow from that and are enforced here: an absent
 *  value must be omitted entirely (`?from=` fails validation just like a bogus key would),
 *  and numbers must serialize as integers — `pageSize=20.5` is rejected by `@IsInt()`. */
export function buildQuery(params: Record<string, QueryValue>): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, typeof value === "number" ? String(Math.trunc(value)) : value);
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}
