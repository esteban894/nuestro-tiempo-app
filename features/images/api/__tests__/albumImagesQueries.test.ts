import { apiFetch } from "@/features/common/api/httpClient";
import { LIST_STALE_TIME_MS } from "@/features/common/api/staleTime";
import { InfiniteQueryObserver, QueryClient } from "@tanstack/react-query";
import { albumImagesQueryOptions } from "../../hooks/useAlbumImagesInfiniteQuery";
import {
  type AlbumImagesData,
  invalidateAfterFavoriteToggle,
  refreshAlbumImagesFirstPage,
  removeImageFromAlbumCache,
} from "../albumImagesCache";
import type { AlbumImage, AlbumImagesPage } from "../image.api";
import { imageKeys } from "../queryKeys";

jest.mock("@/features/common/api/httpClient", () => ({
  ...jest.requireActual("@/features/common/api/httpClient"),
  apiFetch: jest.fn(),
}));

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;
const ALBUM_ID = "album-1";

const image = (id: string): AlbumImage => ({
  id,
  filename: `${id}.jpg`,
  url: `https://cdn/${id}.jpg`,
  size: 1,
  albumId: ALBUM_ID,
  createdAt: "",
  favoritedBy: [],
  favoritedByMe: false,
});

/** Fake API: 3 pages of 2 images, chained by cursor "c1" → "c2" → end. */
function mockPagedApi() {
  mockApiFetch.mockImplementation(async (path) => {
    const cursor = new URL(`https://x${path}`).searchParams.get("cursor");
    const pages: Record<string, AlbumImagesPage> = {
      first: { data: [image("a"), image("b")], pageSize: 2, count: 2, nextCursor: "c1" },
      c1: { data: [image("c"), image("d")], pageSize: 2, count: 2, nextCursor: "c2" },
      c2: { data: [image("e")], pageSize: 2, count: 1, nextCursor: null },
    };
    return pages[cursor ?? "first"] as never;
  });
}

const requestedPaths = () => mockApiFetch.mock.calls.map(([path]) => path);

let queryClient: QueryClient;

beforeEach(() => {
  jest.clearAllMocks();
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});
afterEach(() => queryClient.clear());

function observe(filter: Parameters<typeof albumImagesQueryOptions>[1] = "all") {
  return new InfiniteQueryObserver(queryClient, albumImagesQueryOptions(ALBUM_ID, filter));
}

/** Mounts an observer (like a screen would) and waits for its first page. */
async function mount(filter: Parameters<typeof albumImagesQueryOptions>[1] = "all") {
  const observer = observe(filter);
  const unsubscribe = observer.subscribe(() => {});
  await queryClient.getQueryCache().find({ queryKey: imageKeys.albumList(ALBUM_ID, filter) })?.promise;
  return { observer, unsubscribe };
}

describe("imageKeys", () => {
  it("gives each filter its own list under a shared album prefix", () => {
    const all = imageKeys.albumList(ALBUM_ID, "all");
    const mine = imageKeys.albumList(ALBUM_ID, "me");

    expect(all).not.toEqual(mine);
    expect(all.slice(0, 3)).toEqual([...imageKeys.byAlbum(ALBUM_ID)]);
    expect(mine.slice(0, 3)).toEqual([...imageKeys.byAlbum(ALBUM_ID)]);
  });

  it("defaults to the unfiltered list, which Home and the album screen share", () => {
    expect(imageKeys.albumList(ALBUM_ID)).toEqual(imageKeys.albumList(ALBUM_ID, "all"));
  });
});

describe("albumImagesQueryOptions", () => {
  it("does not send favoritedBy for the unfiltered list", async () => {
    mockPagedApi();
    await mount("all");
    expect(requestedPaths()[0]).toBe(`/images/album/${ALBUM_ID}?pageSize=24`);
  });

  it("sends the filter to the API", async () => {
    mockPagedApi();
    await mount("partner");
    expect(requestedPaths()[0]).toBe(`/images/album/${ALBUM_ID}?pageSize=24&favoritedBy=partner`);
  });

  it("pages with the cursor from the previous page and stops at a null cursor", async () => {
    mockPagedApi();
    const { observer } = await mount();

    await observer.fetchNextPage();
    const last = await observer.fetchNextPage();

    expect(requestedPaths()).toEqual([
      `/images/album/${ALBUM_ID}?pageSize=24`,
      `/images/album/${ALBUM_ID}?pageSize=24&cursor=c1`,
      `/images/album/${ALBUM_ID}?pageSize=24&cursor=c2`,
    ]);
    expect(last.hasNextPage).toBe(false);
  });

  it("treats a response without nextCursor (older API) as the last page", async () => {
    mockApiFetch.mockResolvedValue({ data: [image("a")], pageSize: 24, count: 1 } as never);
    const { observer } = await mount();

    expect(observer.getCurrentResult().hasNextPage).toBe(false);
  });

  it("stays idle without an album id", () => {
    const observer = new InfiniteQueryObserver(queryClient, albumImagesQueryOptions(undefined));
    observer.subscribe(() => {});
    expect(mockApiFetch).not.toHaveBeenCalled();
  });
});

describe("staleTime (30s)", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("reuses fresh data when a screen mounts again within 30s", async () => {
    mockPagedApi();
    const first = await mount();
    first.unsubscribe();

    jest.advanceTimersByTime(LIST_STALE_TIME_MS - 1_000);
    await mount();

    expect(mockApiFetch).toHaveBeenCalledTimes(1);
  });

  it("refetches on mount once the data is older than 30s", async () => {
    mockPagedApi();
    const first = await mount();
    first.unsubscribe();

    jest.advanceTimersByTime(LIST_STALE_TIME_MS + 1);
    await mount();
    await jest.runOnlyPendingTimersAsync();

    expect(mockApiFetch).toHaveBeenCalledTimes(2);
  });

  it("still refetches immediately on invalidation (mutations, pushes)", async () => {
    mockPagedApi();
    await mount();

    await queryClient.invalidateQueries({ queryKey: imageKeys.byAlbum(ALBUM_ID) });

    expect(mockApiFetch).toHaveBeenCalledTimes(2);
  });

  it("still refetches immediately on pull-to-refresh", async () => {
    mockPagedApi();
    const { observer } = await mount();

    await observer.refetch();

    expect(mockApiFetch).toHaveBeenCalledTimes(2);
  });
});

describe("refreshAlbumImagesFirstPage", () => {
  it("refetches only the first page of a list scrolled several pages deep", async () => {
    mockPagedApi();
    const { observer } = await mount();
    await observer.fetchNextPage();
    await observer.fetchNextPage();
    mockApiFetch.mockClear();

    await refreshAlbumImagesFirstPage(queryClient, ALBUM_ID);

    expect(requestedPaths()).toEqual([`/images/album/${ALBUM_ID}?pageSize=24`]);
    const data = queryClient.getQueryData<AlbumImagesData>(imageKeys.albumList(ALBUM_ID));
    expect(data?.pages).toHaveLength(1);
    expect(observer.getCurrentResult().hasNextPage).toBe(true);
  });

  it("trims inactive variants without fetching them", async () => {
    const twoPages: AlbumImagesData = {
      pages: [
        { data: [image("a")], pageSize: 1, count: 1, nextCursor: "c1" },
        { data: [image("b")], pageSize: 1, count: 1, nextCursor: null },
      ],
      pageParams: [null, "c1"],
    };
    queryClient.setQueryData(imageKeys.albumList(ALBUM_ID, "me"), twoPages);

    await refreshAlbumImagesFirstPage(queryClient, ALBUM_ID);

    expect(mockApiFetch).not.toHaveBeenCalled();
    const data = queryClient.getQueryData<AlbumImagesData>(imageKeys.albumList(ALBUM_ID, "me"));
    expect(data?.pages).toHaveLength(1);
    expect(data?.pageParams).toEqual([null]);
    expect(queryClient.getQueryState(imageKeys.albumList(ALBUM_ID, "me"))?.isInvalidated).toBe(true);
  });

  it("does nothing when the album has no cached lists", async () => {
    await expect(refreshAlbumImagesFirstPage(queryClient, ALBUM_ID)).resolves.toBeUndefined();
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it("leaves other albums untouched", async () => {
    const other: AlbumImagesData = {
      pages: [
        { data: [image("x")], pageSize: 1, count: 1, nextCursor: "c1" },
        { data: [image("y")], pageSize: 1, count: 1, nextCursor: null },
      ],
      pageParams: [null, "c1"],
    };
    queryClient.setQueryData(imageKeys.albumList("album-2"), other);

    await refreshAlbumImagesFirstPage(queryClient, ALBUM_ID);

    expect(queryClient.getQueryData<AlbumImagesData>(imageKeys.albumList("album-2"))?.pages).toHaveLength(2);
  });
});

describe("removeImageFromAlbumCache", () => {
  const seed = (filter: "all" | "me", pages: AlbumImage[][]) =>
    queryClient.setQueryData<AlbumImagesData>(imageKeys.albumList(ALBUM_ID, filter), {
      pages: pages.map((data) => ({ data, pageSize: 2, count: data.length, nextCursor: null })),
      pageParams: pages.map((_, i) => (i === 0 ? null : `c${i}`)),
    });

  it("removes the image from every cached variant and page, without refetching", () => {
    seed("all", [[image("a"), image("b")], [image("c")]]);
    seed("me", [[image("b")]]);

    removeImageFromAlbumCache(queryClient, ALBUM_ID, "b");

    const all = queryClient.getQueryData<AlbumImagesData>(imageKeys.albumList(ALBUM_ID, "all"));
    const mine = queryClient.getQueryData<AlbumImagesData>(imageKeys.albumList(ALBUM_ID, "me"));
    expect(all?.pages.map((p) => p.data.map((i) => i.id))).toEqual([["a"], ["c"]]);
    expect(all?.pages[0].count).toBe(1);
    expect(mine?.pages[0].data).toEqual([]);
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it("keeps untouched pages referentially equal", () => {
    seed("all", [[image("a")], [image("c")]]);
    const before = queryClient.getQueryData<AlbumImagesData>(imageKeys.albumList(ALBUM_ID));

    removeImageFromAlbumCache(queryClient, ALBUM_ID, "c");

    const after = queryClient.getQueryData<AlbumImagesData>(imageKeys.albumList(ALBUM_ID));
    expect(after?.pages[0]).toBe(before?.pages[0]);
  });

  it("is a no-op for an image that isn't cached", () => {
    seed("all", [[image("a")]]);
    const before = queryClient.getQueryData(imageKeys.albumList(ALBUM_ID));

    removeImageFromAlbumCache(queryClient, ALBUM_ID, "zzz");

    expect(queryClient.getQueryData(imageKeys.albumList(ALBUM_ID))).toBe(before);
  });
});

describe("invalidateAfterFavoriteToggle", () => {
  it("invalidates the filtered lists and favorites, but not the unfiltered list", () => {
    const empty: AlbumImagesData = { pages: [], pageParams: [] };
    queryClient.setQueryData(imageKeys.albumList(ALBUM_ID, "all"), empty);
    queryClient.setQueryData(imageKeys.albumList(ALBUM_ID, "me"), empty);
    queryClient.setQueryData(imageKeys.albumList(ALBUM_ID, "both"), empty);
    queryClient.setQueryData(imageKeys.favorites("me"), empty);

    invalidateAfterFavoriteToggle(queryClient, ALBUM_ID);

    const invalidated = (key: readonly unknown[]) => queryClient.getQueryState(key)?.isInvalidated;
    expect(invalidated(imageKeys.albumList(ALBUM_ID, "all"))).toBe(false);
    expect(invalidated(imageKeys.albumList(ALBUM_ID, "me"))).toBe(true);
    expect(invalidated(imageKeys.albumList(ALBUM_ID, "both"))).toBe(true);
    expect(invalidated(imageKeys.favorites("me"))).toBe(true);
  });
});
