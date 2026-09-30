import { ApiError, NetworkError, uploadToPresignedUrl } from "../httpClient";

/** Minimal controllable stand-in for React Native's XMLHttpRequest. */
class FakeXhr {
  static last: FakeXhr;
  method?: string;
  url?: string;
  body?: unknown;
  status = 0;
  timeout = 0;
  upload: { onprogress?: (event: Partial<ProgressEvent>) => void } = {};
  onload?: () => void;
  onerror?: () => void;
  ontimeout?: () => void;
  onabort?: () => void;

  constructor() {
    FakeXhr.last = this;
  }
  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }
  send(body: unknown) {
    this.body = body;
  }
  progress(loaded: number, total: number, lengthComputable = true) {
    this.upload.onprogress?.({ loaded, total, lengthComputable });
  }
  respond(status: number) {
    this.status = status;
    this.onload?.();
  }
}

const file = { uri: "file:///photo.jpg", name: "photo.jpg", type: "image/jpeg" };
const originalXhr = global.XMLHttpRequest;

beforeEach(() => {
  global.XMLHttpRequest = FakeXhr as unknown as typeof XMLHttpRequest;
});
afterAll(() => {
  global.XMLHttpRequest = originalXhr;
});

describe("uploadToPresignedUrl", () => {
  it("POSTs the policy fields and the file to the presigned URL", async () => {
    const upload = uploadToPresignedUrl("https://s3.test/bucket", { key: "pending/a/x.jpg" }, file);
    FakeXhr.last.respond(204);
    await upload;

    expect(FakeXhr.last.method).toBe("POST");
    expect(FakeXhr.last.url).toBe("https://s3.test/bucket");
    expect(FakeXhr.last.body).toBeInstanceOf(FormData);
    expect(FakeXhr.last.timeout).toBeGreaterThan(0);
  });

  it("resolves on any 2xx and reports completion", async () => {
    const onProgress = jest.fn();
    const upload = uploadToPresignedUrl("u", {}, file, { onProgress });
    FakeXhr.last.respond(201);

    await expect(upload).resolves.toBeUndefined();
    expect(onProgress).toHaveBeenLastCalledWith(1);
  });

  it("reports progress as a 0–1 fraction", async () => {
    const onProgress = jest.fn();
    const upload = uploadToPresignedUrl("u", {}, file, { onProgress });
    FakeXhr.last.progress(25, 100);
    FakeXhr.last.progress(50, 100);
    FakeXhr.last.respond(204);
    await upload;

    expect(onProgress.mock.calls.map(([fraction]) => fraction)).toEqual([0.25, 0.5, 1]);
  });

  it("never reports more than 1 even if loaded overshoots total", async () => {
    const onProgress = jest.fn();
    const upload = uploadToPresignedUrl("u", {}, file, { onProgress });
    FakeXhr.last.progress(150, 100);
    FakeXhr.last.respond(204);
    await upload;

    expect(onProgress).toHaveBeenNthCalledWith(1, 1);
  });

  it("reports null (indeterminate) when the length is not computable", async () => {
    const onProgress = jest.fn();
    const upload = uploadToPresignedUrl("u", {}, file, { onProgress });
    FakeXhr.last.progress(10, 0, false);
    FakeXhr.last.progress(10, 0, true); // total 0 must not divide by zero
    FakeXhr.last.respond(204);
    await upload;

    expect(onProgress.mock.calls.slice(0, 2)).toEqual([[null], [null]]);
  });

  it("works without a progress handler", async () => {
    const upload = uploadToPresignedUrl("u", {}, file);
    FakeXhr.last.progress(5, 10);
    FakeXhr.last.respond(204);
    await expect(upload).resolves.toBeUndefined();
  });

  it.each([400, 403, 413, 503])("rejects a %i response with an ApiError carrying the status", async (status) => {
    const upload = uploadToPresignedUrl("u", {}, file);
    FakeXhr.last.respond(status);

    await expect(upload).rejects.toBeInstanceOf(ApiError);
    await expect(upload).rejects.toMatchObject({ status });
  });

  it.each([
    ["a transport error", (xhr: FakeXhr) => xhr.onerror?.()],
    ["a timeout", (xhr: FakeXhr) => xhr.ontimeout?.()],
    ["an abort", (xhr: FakeXhr) => xhr.onabort?.()],
  ])("rejects %s with a NetworkError", async (_label, fail) => {
    const upload = uploadToPresignedUrl("u", {}, file);
    fail(FakeXhr.last);

    await expect(upload).rejects.toBeInstanceOf(NetworkError);
  });
});
